var app = app || {}
var appData = JSON.parse(localStorage.getItem("todoData"));
appData = appData || {};
(function (app, data, $) {

    //ENUM:
    var taskStates = {
        New: "to-do",
        Doing: "doing",
        Done: "done",
    };

    var configureEvents = function () {
        //Sortable
        $(".task-list-panel").sortable();
        $(".task-list-panel").disableSelection();
        $(".task-list-panel").bind("sortstop", function (event, ui) {
            $(this).listview('refresh');
        });
        //Add task event
        $("#cmdAddTask").on("click", addTask);
        //Clear form event
        $("#cmdClearForm").on("click", clearForm);
        rebind();
    };

    var rebind = function () {
        var strData = localStorage.getItem("todoData", JSON.stringify(data));
        data = JSON.parse(strData) || {};
        repaint();
    };

    var repaint = function () {
        $.each(data, function (index, item) {
            bindTask(item);
        });
    };

    var bindTask = function (task) {
        var containerElement = $('[data-panel-card-type="' + task.state + '"]');;
        var taskElement = $('[data-task-id="' + task.id + '"]');
        if(taskElement.length >0 ){
            //The task exists
        }else{
            //Is new Task Element
            console.debug(containerElement);
            var taskElement = getTaskElement(task);
            if(taskElement){
                taskElement.appendTo(containerElement);   
            }

        }

        // switch (task.state) {
        //     case taskStates.New:

        //         break;
        //     case taskStates.Doing:
        //         break;
        //     case taskStates.Done:
        //         break;


        // }

    };

    var getTaskElement = function(task){
        var template = $($("#task-item-template")[0].content).children("li").first();
        var workNode = template.clone();
        workNode.data('data-task-id', task.id);
        workNode.find('.task-item-title').html(task.title);
        return workNode;
    }

    var addTask = function () {
        console.log('Adding task');
        var newTask = collectNewTaskData();
        if (newTask.title.length < 1) {
            showWarning("The new task must have a title")
            return;
        }
        if (newTask.description.length < 1) {
            showWarning("The new task must have a description")
            return;
        }
        data[newTask.id] = newTask;
        localStorage.setItem("todoData", JSON.stringify(data));
        clearForm();
        rebind();
    };

    var clearForm = function () {
        var taskName = $("#txtTaskName").val("");
        var taskDescription = $("#txtTaskDescription").val("");
        var expiredDate = $("#txtExpiredDate").val("");
        var taskName = $("#txtTaskName").focus();
    };

    var collectNewTaskData = function () {
        var id = new Date().getTime();
        var taskName = $("#txtTaskName").val();
        var taskDescription = $("#txtTaskDescription").val();
        var expiredDate = $("#txtExpiredDate").val();
        var state = taskStates.New;
        return {
            id: id,
            title: taskName,
            description: taskDescription,
            expiredDate: expiredDate,
            state: state
        };
    };

    var showWarning = function (message) {
        $("#warningMessage").html(message);
        $("#warningsPopup").popup("open");
    }


    app.init = function () {
        configureEvents();
    };


})(app, appData, jQuery);