var app = app || {}
var appData = JSON.parse(localStorage.getItem("todoData"));
appData = appData || {};
(function(app, data, $) {

    var configureEvents = function() {
        //Sortable
        $(".task-list-panel").sortable();
        $(".task-list-panel").disableSelection();
        $(".task-list-panel").bind("sortstop", function(event, ui) {
            $(this).listview('refresh');
        });
        //Add task event
        $("#cmdAddTask").on("click", addTask);
        //Clear form event
        $("#cmdClearForm").on("click", clearForm);
    };

    var addTask = function() {
        console.log('Adding task');
        var newTask = collectNewTaskData();
        if (newTask.title.length < 1) {
            showWarning("The new task must have a title")
            return;
        }
    };

    var clearForm = function() {
        var taskName = $("#txtTaskName").val("");
        var taskDescription = $("#txtTaskDescription").val("");
        var expiredDate = $("#txtExpiredDate").val("");
        var taskName = $("#txtTaskName").focus();
    };

    var collectNewTaskData = function() {
        var id = new Date().getTime();
        var taskName = $("#txtTaskName").val();
        var taskDescription = $("#txtTaskDescription").val();
        var expiredDate = $("#txtExpiredDate").val();
        return {
            id: id,
            title: taskName,
            description: taskDescription,
            expiredDate: expiredDate
        };
    };

    var showWarning = function(message) {
        $("#warningMessage").html(message);
        $("#warningsPopup").popup("open");
    }


    app.init = function() {
        configureEvents();
    };


})(app, appData, jQuery);