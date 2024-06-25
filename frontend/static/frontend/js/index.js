function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}

$(document).ready(function () {
  const btn = document.getElementById('menu-btn');
  const menu = document.getElementById('menu');
  const cover = document.getElementById('cover');
  const in_progress_url = "http://localhost:8000/tasks/in_progress";
  const completed_url = "http://localhost:8000/tasks/completed";
  const overdue_url = "http://localhost:8000/tasks/overdue";

  const statusMap = {
    'IP': 'In Progress',
    'CO': 'Completed',
    'OV': 'Overdue'
  };

  const priorityMap = {
    'HI': 'High',
    'LO': 'Low',
    'ME': 'Medium'
  };
  
  
  async function loadTasks(url, container, id) {
    try {
        const response = await $.ajax({
            url: url,
            method: 'GET'
        });

        $(container).empty();
        $(id).text(`(${response[id.replace("#", "")]})`)
        response.tasks.forEach(function(task) {
          const status = statusMap[task.status] || task.status; // Default to original if no match
          const priority = priorityMap[task.priority] || task.priority;
          const time = data_converter(task.due_date)
          const taskElement = `<div class="space-y-2 rounded-md">
                <div class="flex justify-between">
                    <div class="bg-red-200 py-1 px-4 rounded-md text-red-900 font-bold">${priority}</div>
                    <div class="flex shadow-2xl shadow-black rounded-md space-x-2 text-center py-1 px-2 ">
                        <img src="static/frontend/img/clock.png" alt="" class="w-6 h-6">
                        <span class="text-violet-500 font-semibold">${time}</span>
                    </div>
                    <div class="bg-gray-500/20 text-center py-1 text-violet-500 font-medium rounded-md px-3">${task.category}</div>
                </div>
                <div class="bg-gray-500/20 px-2 py-4 space-y-3 shadow-xl">
                    <div class="flex justify-between">
                        <h1 class="font-medium text-xl">${task.title}</h1>
                        <img src="static/frontend/img/kebab-gray.png" alt="" class="w-6 h-6">
                    </div>
                    <div class="space-y-2">
                        <p class="text-gray-500">${task.description}</p>
                        <div class="border rounded-md border-gray-500/30 w-16 p-1 flex items-center justify-around">
                            <img src="static/frontend/img/task2.png" alt="" class="w-4 h-4">
                            <span class="text-gray-500">0/3</span>
                        </div>
                    </div>
                    <div class="flex items-center justify-around space-x-2">
                        <a href=""><img src="static/frontend/img/eye.png" alt="" class="w-8 h-8"></a>
                        <a href=""><img src="static/frontend/img/bin.png" alt="" class="w-8 h-8"></a>
                        <div class="edit-task-btn cursor-pointer" data-id="${task.id}"><img src="static/frontend/img/pen.png" alt="" class="w-8 h-8"></div>
                    </div>
                </div>
              </div>`;
            $(container).append(taskElement);
        });

    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
  }

  loadTasks(in_progress_url, "#in_progress_task", "#inprogress_count")
  loadTasks(completed_url, "#completed_task", "#completed_count")
  loadTasks(overdue_url, "#overdue_task", "#overdue_count")

  btn.addEventListener("click", navToggle)
  cover.addEventListener("click", navToggle)
  
  function navToggle() {
    btn.classList.toggle('open')
    menu.classList.toggle('block')
    menu.classList.toggle('hidden')
    cover.classList.toggle('hidden')
  }

  $('#inprogress').click(function(){
    $('#in_progress_task').slideToggle();
  })

  $('#completed').click(function(){
    $('#completed_task').slideToggle();
  })

  $('#overdue').click(function(){
    $('#overdue_task').slideToggle();
  })

  $('#addtask-modal').hide();
  $('#editTaskModal').hide();
  $('#add-task').click(function(){
    $('#addtask-modal').show();
  })

  $('.close-btn').click(function(){
    $('#addtask-modal').hide();
    $('#editTaskModal').hide();
  })

  $('#createTaskForm').on('submit', function(event) {
    event.preventDefault();

    const formData = {
        title: $('#title').val(),
        description: $('#description').val(),
        status: $('#status').val(),
        priority: $('#priority').val(),
        due_date: $('#due_date').val(),
        category: $('#category').val()
    };
    console.log(JSON.stringify(formData))
    $.ajax({
        url: 'http://localhost:8000/tasks/',  // Your API endpoint to create tasks
        method: 'POST',
        data: JSON.stringify(formData),
        contentType: 'application/json',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')  // Include CSRF token if needed
        },
        success: function(response) {
            // Handle success (e.g., refresh the task list, close modal)
            alert('Task created successfully');
            $('#addtask-modal').hide();
            // Reload the task list
            loadTasks(in_progress_url, "#in_progress_task", "#inprogress_count")
            loadTasks(completed_url, "#completed_task", "#completed_count")
            loadTasks(overdue_url, "#overdue_task", "#overdue_count")  
        },
        error: function(xhr, status, error) {
            // Handle error
            alert('Error creating task: ' + error);
        }
    });
  });


  

  $('#editTaskForm').on('submit', function(event) {
      event.preventDefault();

      const taskId = $('#editId').val();
      console.log(taskId)
      const formData = {
        title: $('#editTitle').val(),
        description: $('#editDescription').val(),
        status: $('#editStatus').val(),
        priority: $('#editPriority').val(),
        due_date: $('#edit_Due_date').val(),
        category: $('#editCategory').val()
    };

      $.ajax({
          url: 'http://localhost:8000/tasks/' + taskId + '/update/',
          method: 'PUT',
          data: JSON.stringify(formData),
          contentType: 'application/json',
          headers: {
              'X-CSRFToken': getCookie('csrftoken')
          },
          success: function(response) {
              alert('Task updated successfully');
              $('#editTaskModal').hide();
              // Reload the task list
              loadTasks(in_progress_url, "#in_progress_task", "#inprogress_count")
              loadTasks(completed_url, "#completed_task", "#completed_count")
              loadTasks(overdue_url, "#overdue_task", "#overdue_count")
          },
          error: function(xhr, status, error) {
              alert('Error updating task: ' + error);
          }
      });
  });
});

function data_converter(dueDateStr){
  // Convert due_date string to Date object (considering it's in UTC)
  const dueDate = new Date(dueDateStr);

  // Extract hours and minutes
  const hours = dueDate.getHours(); // Get hours (24-hour format)
  const minutes = dueDate.getMinutes(); // Get minutes

  // Determine AM or PM based on hours
  const ampm = hours >= 12 ? 'PM' : 'AM';

  // Convert hours to 12-hour format
  const hours12 = hours % 12 || 12; // Convert to 12-hour format

  // Format time string
  const timeStr = `${hours12}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;

  return timeStr;

}

$(document).on('click', '.edit-task-btn', function(){
  $('.edit-task-btn').click(function() {
    const taskId = $(this).data('id');
    console.log(taskId)
    // Fetch task data and populate the form
    $.get('http://localhost:8000/tasks/' + taskId, function(data) {
        const dueDate = new Date(data.due_date);
        const formattedDueDate = dueDate.toISOString().slice(0, 16); // Get 'YYYY-MM-DDTHH:MM' format
        
        $('#editId').val(data.id)
        $('#editTitle').val(data.title);
        $('#editDescription').val(data.description);
        $('#edit_Due_date').val(formattedDueDate);
        $('#editStatus').val(data.status);
        $('#editPriority').val(data.priority);
        $('#editCategory').val(data.category);
        $('#editTaskModal').show();
    });
  });
});