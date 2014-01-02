package models

type Event struct {
	Id		int `json:"db_id"`
	Title	string `json:"title"`
	Start	string `json:"start"`
	End		string `json:"end"`
	Duration float64 `json:"duration"`
}