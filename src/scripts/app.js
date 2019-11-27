var app = app || {};
(function (appContext, $) {
    var taskStates = {
        New: "to-do",
        Doing: "doing",
        Done: "done",
    };
    var cacheResult = {
        lastIdForDelete: null,
        lastEditTask: null
    };
    var localStorageRepository = {
        create: function (task) {
            var data = this.read();
            data[task.id || new Date().getTime()] = task;
            this.adapter.write(data);
        },
        read: function (filter) {
            var data = this.adapter.read();
            if (typeof filter === 'undefined') {
                return data;
            };
            if (typeof filter === 'number') {
                return data[filter];
            };
            return {};
        },
        update: function (task) {
            var data = this.adapter.read();
            data[task.id] = task;
            this.adapter.write(data);
        },
        delete: function (taskId) {
            var data = this.adapter.read();
            delete data[taskId];
            this.adapter.write(data);
        },
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
        $(".task-list-panel").sortable();
        $(".task-list-panel").disableSelection();
        $(".task-list-panel").bind("sortstop", function (event, ui) {
            $(this).listview('refresh');
        });
        $("#cmdAddTask").on("click", addTask);
        $("#cmdClearForm").on("click", clearForm);
        $("#cmdCancelDelete").on("click", cancelDeleteTask);
        $("#cmdDeleteTask").on("click", deleteTask);
        $(document).on("click", '.task-delete-comand', prepareTaskForDelete);
        $(document).on("click", '.move-task', moveTask);
        $(document).on("click", '.edit-task', performEditTask);
        rebind();
    };
    var rebind = function () {
        clearTaskLists();
        var data = localStorageRepository.read();
        $.each(data, function (index, item) {
            bindTask(item);
        });
        refreshListViews();
    };
    var refreshListViews = function () {
        $('[data-role="listview"]').each(function (index) {
            $(this).listview('refresh');
        });
    };
    var clearTaskLists = function () {
        $(".task-list-panel").empty();
    };
    var bindTask = function (task) {
        var containerElement = $('[data-panel-card-type="' + task.state + '"]');;
        var taskElement = $('[data-task-id="' + task.id + '"]');
        if (taskElement.length > 0) { }
        else {
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
        workNode.data('taskId', task.id);
        workNode.find('.task-item-title').html(task.title);
        workNode.find('.task-item-description').html(task.description);
        workNode.find('.task-item-date').html(task.expiredDate);
        workNode.find('.task-delete-comand').attr('data-id', task.id);
        workNode.find('[data-move-to="' + task.state + '"]').remove();
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
            expandPanel(newTask.state)
        }, 'Adding new task...');
    };
    var prepareTaskForDelete = function (e) {
        var taskId = $(this).attr('data-id');
        cacheResult.lastIdForDelete = taskId;
    };
    var deleteTask = function (e) {
        if (cacheResult.lastIdForDelete && cacheResult.lastIdForDelete > 0) {
            localStorageRepository.delete(cacheResult.lastIdForDelete);
            cacheResult.lastIdForDelete = null;
            rebind();
        } else {
            console.log('Nothing for delete');
        }
    };
    var cancelDeleteTask = function (e) {
        cacheResult.lastIdForDelete = null;
    };
    var moveTask = function (e) {
        var taskElement = $(this).parents('li.task-item');
        var taskId = taskElement.data('taskId');
        var task = localStorageRepository.read(taskId);
        var moveTo = $(this).data("move-to");
        task.state = moveTo;
        localStorageRepository.update(task);
        rebind();
    };
    var performEditTask = function (e) {
        var taskElement = $(this).parents('li.task-item');
        var taskId = taskElement.data('taskId');
        var task = localStorageRepository.read(taskId);
        localStorageRepository.delete(taskId);
        cacheResult.lastEditTask = task;
        prepareTaskForEdit(task);
    };
    var prepareTaskForEdit = function (task) {
        if (typeof task !== 'undefined' && task != null) {
            $('#txtTaskName').val(task.title);
            $('#txtTaskDescription').val(task.description);
            $('#txtExpiredDate').val(task.expiredDate);
            $("input[name='radio-task-state'][value=" + task.state + "]").attr('checked', 'checked').checkboxradio( "refresh" );
            refreshControlGroup('radioListState');            
            $("#cmdClearForm").val('Cancel edit task').button("refresh");
            $("#cmdAddTask").val('Save').button("refresh");
            $("#txtTaskName").focus();
            expandPanel('edit');
        }
    };
    var clearForm = function () {
        $("#txtTaskName").val("");
        $("#txtTaskDescription").val("");
        $("#txtExpiredDate").val("");
        $("#radioListState input[type='radio']").attr('checked', false);
        refreshControlGroup('radioListState');
        $("#txtTaskName").focus();
    };
    var collectNewTaskData = function () {
        var id = new Date().getTime();
        var taskName = $("#txtTaskName").val();
        var taskDescription = $("#txtTaskDescription").val();
        var expiredDate = $("#txtExpiredDate").val();
        var selectedStateEl = $("#radioListState input[type='radio']:checked");
        var selectedState = taskStates.New
        if (selectedStateEl.length > 0) {
            selectedState = selectedStateEl.val();
        }
        var state = selectedState;
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
    var refreshControlGroup = function (id) {
        $("#" + id).controlgroup('refresh');
    };
    var performOperation = function (operation, msg) {
        if (typeof operation !== 'function')
            return;
        console.log(msg);
        showLoading(msg);
        operation.apply();
        hideLoading();
    };
    var showLoading = function (msg) {
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
