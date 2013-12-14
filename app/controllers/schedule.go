package controllers

import (
	"github.com/robfig/revel"
	"github.com/kbkelly/gtd-panic/app/models"
)

type Schedule struct {
	Application
}

func (c Schedule) Show() revel.Result {
	var size int = 10
	var tasks []*models.Task
	tasks = loadTasks(c.Txn.Select(models.Task{},
		`select * from Task limit ?`, size))

	return c.Render(tasks)
}

func loadTasks(results []interface{}, err error) []*models.Task {
	if err != nil {
		panic(err)
	}
	var tasks []*models.Task
	for _, r := range results {
		tasks = append(tasks, r.(*models.Task))
	}
	return tasks
}
