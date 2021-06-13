package main

import (
	"log"
	"math"
	"net/http"
	"strconv"
)

func main() {
	http.Handle("/", http.FileServer(http.Dir("public")))

	http.HandleFunc("/file", func(w http.ResponseWriter, r *http.Request) {
		name := r.URL.Query().Get("name")
		mb, err := strconv.Atoi(r.URL.Query().Get("size"))
		if err != nil {
			log.Println(err)
			http.Error(
				w,
				"400 Bad Request: valid size required",
				http.StatusBadRequest,
			)
			return
		}

		b := make([]byte, mb*int(math.Pow(2, 20)))
		for i := range b {
			b[i] = 0
		}

		w.Header().Set(
			"content-disposition",
			"attachment; filename=\""+name+" ("+strconv.Itoa(mb)+" MB).file\"",
		)
		w.Header().Set("content-length", strconv.Itoa(len(b)))
		w.Header().Set("content-type", "application/octet-stream")

		if _, err := w.Write(b); err != nil {
			log.Panicln(err)
		}
	})

	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Panicln(err)
	}
}
