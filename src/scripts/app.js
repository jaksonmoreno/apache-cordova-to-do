var app = app || {};
//var appData = JSON.parse(localStorage.getItem("todoData-Tasks"));
//appData = appData || {};
(function (appContext, $) {
    
    //ENUM:
    var taskStates = {
        New: "to-do",
        Doing: "doing",
        Done: "done",
    };

    var localStorageRepository = {
        create : function(task){
            var data = this.read() || {};    
            data[task.id || new Date().getTime()] = task;
            localStorage.setItem("todoData-Tasks", JSON.stringify(data));
        },
        read: function(filter){
            var strData = localStorage.getItem('todoData-Tasks');
            var data = JSON.parse(strData) || {};
            if(!filter){
                return data;
            }
        },
        update: function(task){

        },
        delete: function(taskId){

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
        rebind();
    };

    

    var rebind = function () {
        var data = localStorageRepository.read();
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
        $(taskElement).trigger("create");
        containerElement.listview('refresh');

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
        workNode.find('.task-item-description').html(task.description);
        workNode.find('.task-item-date').html(task.expiredDate);        
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
        localStorageRepository.create(newTask);
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


    var expandPanel = function(forStatus){
        var panelElement = $('[data-panel-card-type="' + task.state + '"]');;
        //$("#set").children(":last").trigger( "expand" );
        //https://demos.jquerymobile.com/1.3.1/examples/collapsibles/dynamic-collapsible.html#&ui-state=dialog&ui-state=dialog
    }


    appContext.init = function () {
        console.log('Init...');
        configureEvents();
    };


})(app, jQuery);