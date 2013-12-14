package models

import (
	"time"
)

type Event struct {
	Title	string `json:"title"`
	Start	string `json:"start"`
	End		string `json:"end"`
	Duration time.Duration
}