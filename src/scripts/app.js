var app = app || {};

(function (appContext, $) {

    //ENUM:
    var taskStates = {
        New: "to-do",
        Doing: "doing",
        Done: "done",
    };

    //Data Repository
    var localStorageRepository = {
        create: function (task) {
            var data = this.read();
            data[task.id || new Date().getTime()] = task;
            this.adapter.write(data)
        },
        read: function (filter) {
            var data = this.adapter.read();
            if (!filter) {
                return data;
            }
        },
        update: function (task) { },
        delete: function (taskId) { },
        adapter: {
            read: function () {
                var data = localStorage.getItem('todoData-Tasks');
                return JSON.parse(data) || {};
            },
            write: function (data) {
                localStorage.setItem("todoData-Tasks", JSON.stringify(data));
            }
        }
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
        $("#cmdDeleteTask").on("click", deleteTask);
        rebind();
    };

    var rebind = function () {
        var data = localStorageRepository.read();
        $.each(data, function (index, item) {
            bindTask(item);
        });
        refreshListViews();
    };

    var refreshListViews = function(){
        $('[data-role="listview"]').each(function(index){
            //$(this).listview('refresh');
        });
    };

    var bindTask = function (task) {
        var containerElement = $('[data-panel-card-type="' + task.state + '"]');;
        var taskElement = $('[data-task-id="' + task.id + '"]');
        if (taskElement.length > 0) {
            //The task exists
        } else {
            //Is new Task Element
            console.log("....");
            var taskElement = getTaskElement(task);
            if (taskElement) {
                taskElement.appendTo(containerElement);
            }

        }
        $(taskElement).trigger("create");        
    };

    var getTaskElement = function (task) {
        var template = $($("#task-item-template")[0].content).children("li").first();
        var workNode = template.clone();
        workNode.data('data-task-id', task.id);
        workNode.find('.task-item-title').html(task.title);
        workNode.find('.task-item-description').html(task.description);
        workNode.find('.task-item-date').html(task.expiredDate);
        workNode.find('.task-delete-comand').attr('data-id', task.id)
        return workNode;
    };

    var addTask = function () {
        performOperation(function () {
            var newTask = collectNewTaskData();
            if (newTask.title.length < 1) {
                showWarning("The new task must have a title")
                return;
            }
            if (newTask.description.length < 1) {
                showWarning("The new task must have a description")
                return;
            }
            localStorageRepository.create(newTask);
            clearForm();
            rebind();
            expandPanel(taskStates.New)
        }, 'Adding new task...');
    };

    var deleteTask = function(){
        console.log('Delete task');

    };


    var clearForm = function () {
        $("#txtTaskName").val("");
        $("#txtTaskDescription").val("");
        $("#txtExpiredDate").val("");
        $("#txtTaskName").focus();
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
    };

    var expandPanel = function (forStatus) {

        var panel = $('#taskPanels').children('[data-panel-card="' + forStatus + '"]');
        panel.collapsible('expand')
    };


    var performOperation = function (operation, msg) {
        if (typeof operation !== 'function') return;
        console.log(msg);
        showLoading(msg);
        operation.apply();
        hideLoading();
    };


    var showLoading = function (msg) {
        console.log(msg + " loading");
        $.mobile.loading("show", {
            text: msg,
            textVisible: true,
        });
    };

    var hideLoading = function () {
        $.mobile.loading("hide");
    };

    appContext.init = function () {
        configureEvents();
    };

})(app, jQuery);
