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
                    <div class="flex justify-between">
                        <div class="flex items-center">
                            <img src="https://via.placeholder.com/40" alt="" class="w-6 h-6 rounded-full border-2 border-white">
                            <img src="https://via.placeholder.com/40" alt="" class="w-6 h-6 rounded-full border-2 border-white overlap-10">
                            <img src="https://via.placeholder.com/40" alt="" class="w-6 h-6 rounded-full border-2 border-white overlap-10">
                            <div class="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold overlap-10 text-sm">+2</div>
                        </div>
                        <div class="flex items-center justify-center space-x-2">
                            <a href=""><img src="static/frontend/img/eye.png" alt="" class="w-7 h-7"></a>
                            <a href=""><img src="static/frontend/img/bin.png" alt="" class="w-6 h-6"></a>
                            <a href=""><img src="static/frontend/img/pen.png" alt="" class="w-6 h-6"></a>
                        </div>
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
