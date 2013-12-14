package controllers

import (
	"github.com/robfig/revel"
	"github.com/kbkelly/gtd-panic/app/models"
)

type Schedule struct {
	Application
}

func (c Schedule) Show() revel.Result {
	events := []*models.Event{
		&models.Event{"Foo", "2013-12-13 10:00", "2013-12-13 11:00", false},
		&models.Event{"Bar", "2013-12-13 12:00", "2013-12-13 13:00", false},
		&models.Event{"Baz", "2013-12-13 14:00", "2013-12-13 15:00", false},
	}
	// tasks = loadTasks(c.Txn.Select(models.Task{},
	// 	`select * from Task limit ?`, size))

	return c.RenderJson(events)
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
// csvReader.TrailingComma = true
// for {
//     fields, err := csvReader.Read()
//     if err == io.EOF {
//         break
//     } else if err != nil {
//         panic(err)
//     }
//     // ... do stuff ...
// }

