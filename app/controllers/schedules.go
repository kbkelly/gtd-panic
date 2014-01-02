package controllers

import (
	// "database/sql"
	"github.com/coopernurse/gorp"
	_ "github.com/mattn/go-sqlite3"
	"encoding/json"
	rev "github.com/robfig/revel"
	"github.com/robfig/revel/modules/db/app"
	"github.com/kbkelly/gtd-panic/app/models"
)

var (
	Dbm *gorp.DbMap
)

func Init() {
	db.Init()
	Dbm = &gorp.DbMap{Db: db.Db, Dialect: gorp.SqliteDialect{}}

	setColumnSizes := func(t *gorp.TableMap, colSizes map[string]int) {
		for col, size := range colSizes {
			t.ColMap(col).MaxSize = size
		}
	}

	t := Dbm.AddTable(models.Event{}).SetKeys(true, "Id")
	setColumnSizes(t, map[string]int{
		"Title": 255,
		"Start": 24,
		"End": 24,
	})

	Dbm.TraceOn("[gorp]", rev.INFO)
	err := Dbm.CreateTablesIfNotExists()
	if err != nil {
		panic(err)
	}
}

type Schedules struct {
	Application
}

func (c Schedules) Create() rev.Result {
	Init()
	var events []*models.Event
	err := json.NewDecoder(c.Request.Body).Decode(&events)
	if err != nil {
		rev.ERROR.Println(err)
	}
	saveEvents(events)
	return c.RenderJson(events)
}

func saveEvents(events []*models.Event) {
	for _, event := range events {
		err := Dbm.Insert(event)
		if err != nil {
			panic(err)
		}
	}
}