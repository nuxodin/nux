
function setField(table, scheme){
    if (scheme.indexed) {
        table.createIndex(field.name, field.name, { unique: scheme.unique });
    }
}


/*
// example:

var request = window.indexedDB.open("toDoList", 4);
request.onupgradeneeded = function(event) {
    var db = event.target.result;

    db.onerror = function(event) {
        note.innerHTML += "<li>Error loading database.</li>";
    };


    for (table of struct) {
        var table = db.createObjectStore(table.name, { keyPath: "taskTitle" });
        for (field of table.fields) {
            ensureField(table, scheme)
        }
    }

};
*/