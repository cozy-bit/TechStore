package main

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
)

type UserRole string

const (
	RoleUser  UserRole = "user"
	RoleAdmin UserRole = "admin"
)

type User struct {
	Email    string   `json:"email"`
	Password string   `json:"-"`
	Role     UserRole `json:"role"`
}

type Product struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Price       int    `json:"price"`
	Currency    string `json:"currency"`
	Description string `json:"description"`
	Image       string `json:"image"`
	CategoryID  string `json:"categoryId"`
	Brand       string `json:"brand"`
	Popularity  int    `json:"popularity"`
	Status      string `json:"status,omitempty"`
	Specs       string `json:"specs,omitempty"`
}

type serverState struct {
	users    map[string]User
	products []Product
	mu       sync.RWMutex
	ws       *wsHub
}

type wsHub struct {
	mu      sync.Mutex
	clients map[*websocket.Conn]struct{}
}

func newWSHub() *wsHub {
	return &wsHub{clients: map[*websocket.Conn]struct{}{}}
}

func (h *wsHub) add(c *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clients[c] = struct{}{}
}

func (h *wsHub) remove(c *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.clients, c)
	_ = c.Close()
}

func (h *wsHub) broadcast(event string, payload any) {
	h.mu.Lock()
	defer h.mu.Unlock()
	msg := gin.H{"event": event, "payload": payload}
	for c := range h.clients {
		if err := c.WriteJSON(msg); err != nil {
			_ = c.Close()
			delete(h.clients, c)
		}
	}
}

var jwtSecret = []byte("dev-secret-change-me")

func main() {
	if env := os.Getenv("JWT_SECRET"); env != "" {
		jwtSecret = []byte(env)
	}

	_ = os.MkdirAll("./uploads", 0o755)

	s := &serverState{
		users: map[string]User{
			"admin@tech.local": {Email: "admin@tech.local", Password: "admin123", Role: RoleAdmin},
		},
		products: []Product{},
		ws:       newWSHub(),
	}

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		AllowCredentials: false,
		MaxAge:           12 * time.Hour,
	}))

	r.Static("/uploads", "./uploads")
	r.GET("/health", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"ok": true}) })

	r.POST("/register", s.handleRegister)
	r.POST("/login", s.handleLogin)
	r.GET("/products", s.handleGetProducts)
	r.GET("/categories", func(c *gin.Context) {
		c.JSON(http.StatusOK, []gin.H{
			{"id": "cat-laptops", "name": "Ноутбуки", "slug": "laptops"},
			{"id": "cat-phones", "name": "Смартфоны", "slug": "smartphones"},
			{"id": "cat-tablets", "name": "Планшеты", "slug": "tablets"},
		})
	})
	r.GET("/ws/products", s.handleProductsWS)

	auth := r.Group("/")
	auth.Use(authMiddleware)
	auth.POST("/products", s.handleCreateProduct)
	auth.PUT("/products/:id", requireRole(RoleAdmin), s.handleUpdateProduct)
	auth.DELETE("/products/:id", requireRole(RoleAdmin), s.handleDeleteProduct)

	log.Println("backend started on :8080")
	log.Fatal(r.Run(":8080"))
}

func (s *serverState) handleRegister(c *gin.Context) {
	var req struct {
		Email    string   `json:"email"`
		Password string   `json:"password"`
		Role     UserRole `json:"role"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Email == "" || len(req.Password) < 4 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid credentials"})
		return
	}
	if req.Role != RoleAdmin {
		req.Role = RoleUser
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.users[req.Email]; ok {
		c.JSON(http.StatusConflict, gin.H{"error": "user exists"})
		return
	}
	s.users[req.Email] = User{Email: req.Email, Password: req.Password, Role: req.Role}
	token, _ := buildJWT(req.Email, req.Role)
	c.JSON(http.StatusOK, gin.H{"token": token, "email": req.Email, "role": req.Role})
}

func (s *serverState) handleLogin(c *gin.Context) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}
	email := strings.TrimSpace(strings.ToLower(req.Email))
	s.mu.RLock()
	user, ok := s.users[email]
	s.mu.RUnlock()
	if !ok || user.Password != req.Password {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}
	token, _ := buildJWT(user.Email, user.Role)
	c.JSON(http.StatusOK, gin.H{"token": token, "email": user.Email, "role": user.Role})
}

func (s *serverState) handleGetProducts(c *gin.Context) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	c.JSON(http.StatusOK, s.products)
}

func (s *serverState) handleCreateProduct(c *gin.Context) {
	name := strings.TrimSpace(c.PostForm("name"))
	description := strings.TrimSpace(c.PostForm("description"))
	priceRaw := strings.TrimSpace(c.PostForm("price"))
	categoryID := strings.TrimSpace(c.PostForm("categoryId"))
	brand := strings.TrimSpace(c.PostForm("brand"))
	specs := strings.TrimSpace(c.PostForm("specs"))
	status := strings.TrimSpace(c.PostForm("status"))
	if status == "" {
		status = "published"
	}
	if name == "" || description == "" || priceRaw == "" || categoryID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing required fields"})
		return
	}
	price, err := strconv.Atoi(priceRaw)
	if err != nil || price <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid price"})
		return
	}

	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "image is required"})
		return
	}
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext == "" {
		ext = ".jpg"
	}
	switch ext {
	case ".jpg", ".jpeg", ".png", ".webp", ".gif":
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "image type not allowed"})
		return
	}
	fileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	path := filepath.Join("uploads", fileName)
	if err := c.SaveUploadedFile(file, path); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save image"})
		return
	}

	product := Product{
		ID:          fmt.Sprintf("srv-%d", time.Now().UnixNano()),
		Name:        name,
		Slug:        slugify(name),
		Price:       price,
		Currency:    "RUB",
		Description: description,
		Image:       "/uploads/" + fileName,
		CategoryID:  categoryID,
		Brand:       brand,
		Popularity:  1,
		Status:      status,
		Specs:       specs,
	}

	s.mu.Lock()
	s.products = append([]Product{product}, s.products...)
	s.mu.Unlock()
	s.ws.broadcast("new_product", product)
	c.JSON(http.StatusCreated, product)
}

func (s *serverState) handleUpdateProduct(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Price       int    `json:"price"`
		Brand       string `json:"brand"`
		Status      string `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.products {
		if s.products[i].ID == id {
			if req.Name != "" {
				s.products[i].Name = req.Name
				s.products[i].Slug = slugify(req.Name)
			}
			if req.Description != "" {
				s.products[i].Description = req.Description
			}
			if req.Price > 0 {
				s.products[i].Price = req.Price
			}
			if req.Brand != "" {
				s.products[i].Brand = req.Brand
			}
			if req.Status != "" {
				s.products[i].Status = req.Status
			}
			c.JSON(http.StatusOK, s.products[i])
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
}

func (s *serverState) handleDeleteProduct(c *gin.Context) {
	id := c.Param("id")
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.products {
		if s.products[i].ID == id {
			s.products = append(s.products[:i], s.products[i+1:]...)
			c.Status(http.StatusNoContent)
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func (s *serverState) handleProductsWS(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	s.ws.add(conn)
	defer s.ws.remove(conn)
	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			return
		}
	}
}

func buildJWT(email string, role UserRole) (string, error) {
	claims := jwt.MapClaims{
		"sub":  email,
		"role": role,
		"exp":  time.Now().Add(72 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func authMiddleware(c *gin.Context) {
	h := c.GetHeader("Authorization")
	parts := strings.SplitN(h, " ", 2)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
		return
	}
	tokenStr := parts[1]
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("bad signing method")
		}
		return jwtSecret, nil
	})
	if err != nil || !token.Valid {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
		return
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid claims"})
		return
	}
	c.Set("email", fmt.Sprint(claims["sub"]))
	c.Set("role", fmt.Sprint(claims["role"]))
	c.Next()
}

func requireRole(role UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		v := c.GetString("role")
		if v != string(role) {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "insufficient role"})
			return
		}
		c.Next()
	}
}

func slugify(in string) string {
	s := strings.ToLower(strings.TrimSpace(in))
	s = strings.ReplaceAll(s, " ", "-")
	s = strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' {
			return r
		}
		return -1
	}, s)
	if s == "" {
		return fmt.Sprintf("product-%d", time.Now().Unix())
	}
	return s
}

