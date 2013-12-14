package controllers

import (
	"github.com/robfig/revel"
	"github.com/kbkelly/gtd-panic/app/models"
)

type Schedule struct {
	Application
}

func (c Schedule) Show() revel.Result {
	tasks := []*models.Task{
		&models.Task{1, "Foo"},
		&models.Task{2, "Bar"},
		&models.Task{3, "Baz"},
	}
	// tasks = loadTasks(c.Txn.Select(models.Task{},
	// 	`select * from Task limit ?`, size))

	return c.RenderJson(tasks)
}

// func loadTasks(results []interface{}, err error) []*models.Task {
// 	if err != nil {
// 		panic(err)
// 	}
// 	var tasks []*models.Task
// 	for _, r := range results {
// 		tasks = append(tasks, r.(*models.Task))
// 	}
// 	return tasks
// }


// csvFile, err := os.Open("/path/myfile.csv")
// defer csvFile.Close()
// if err != nil {
//     panic(err)
// }
// csvReader := csv.NewReader(csvFile)
// for {
//     fields, err := csvReader.Read()
//     if err == io.EOF {
//         break
//     } else if err != nil {
//         panic(err)
//     }
//     // ... do stuff ...
// }
