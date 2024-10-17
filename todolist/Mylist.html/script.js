const categoryInput = document.getElementById('categoryInput');
const addCategoryButton = document.getElementById('addCategoryButton');
const categoryList = document.getElementById('categoryList');
const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDateInput');
const categorySelect = document.getElementById('categorySelect');
const addTaskButton = document.getElementById('addTaskButton');
const taskList = document.getElementById('taskList');
const analyticsChart = document.getElementById('analyticsChart');
const categoryCompletion = document.getElementById('categoryCompletion');

let categories = JSON.parse(localStorage.getItem('categories')) || [];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let editingTaskIndex = null;

// Function to display categories
function displayCategories() {
    categoryList.innerHTML = '';
    categorySelect.innerHTML = '';
    categories.forEach((category, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${category}
            <button onclick="removeCategory(${index})">Delete</button>
        `;
        categoryList.appendChild(li);

        const option = document.createElement('option');
        option.value = category;
        option.innerText = category;
        categorySelect.appendChild(option);
    });
}

// Function to add a new category
addCategoryButton.addEventListener('click', () => {
    const category = categoryInput.value.trim();
    if (category) {
        categories.push(category);
        localStorage.setItem('categories', JSON.stringify(categories));
        categoryInput.value = '';
        displayCategories();
        alert('Category added!');
    }
});

// Function to remove a category
function removeCategory(index) {
    categories.splice(index, 1);
    localStorage.setItem('categories', JSON.stringify(categories));
    displayCategories();
    alert('Category removed!');
}

// Function to add or update a task
addTaskButton.addEventListener('click', () => {
    const taskName = taskInput.value.trim();
    const dueDate = dueDateInput.value;
    const selectedCategories = Array.from(categorySelect.selectedOptions).map(option => option.value);
    
    if (taskName) {
        if (editingTaskIndex !== null) {
            tasks[editingTaskIndex] = { name: taskName, dueDate, categories: selectedCategories, completed: false };
            editingTaskIndex = null;
            addTaskButton.textContent = 'Add Task';
            alert('Task updated!');
        } else {
            tasks.push({ name: taskName, dueDate, categories: selectedCategories, completed: false });
            alert('Task added!');
        }

        localStorage.setItem('tasks', JSON.stringify(tasks));
        taskInput.value = '';
        dueDateInput.value = '';
        displayTasks();
        updateAnalytics();
    } else {
        alert('Task name cannot be empty!');
    }
});

// Function to display tasks
function displayTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;

        li.style.color = isOverdue ? 'red' : 'black';
        li.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${index})">
            ${task.name} - ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
            (${task.categories.join(', ')})
            <button onclick="editTask(${index})">Edit</button>
            <button onclick="removeTask(${index})">Delete</button>
        `;
        taskList.appendChild(li);
    });
}

// Function to toggle task completion
function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    displayTasks();
    updateAnalytics();
}

// Function to edit a task
function editTask(index) {
    const task = tasks[index];
    taskInput.value = task.name;
    dueDateInput.value = task.dueDate;

    Array.from(categorySelect.options).forEach(option => {
        option.selected = task.categories.includes(option.value);
    });

    editingTaskIndex = index;
    addTaskButton.textContent = 'Update Task';
}

// Function to remove a task
function removeTask(index) {
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    displayTasks();
    updateAnalytics();
    alert('Task removed!');
}

// Function to update analytics
function updateAnalytics() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;

    const completionRates = categories.map(category => {
        const categoryTasks = tasks.filter(task => task.categories.includes(category));
        const categoryCompleted = categoryTasks.filter(task => task.completed).length;
        return categoryCompleted / (categoryTasks.length || 1);
    });

    const completionPercentage = categories.map((category, index) => {
        return `${category}: ${(completionRates[index] * 100).toFixed(2)}%`;
    }).join('<br>');

    categoryCompletion.innerHTML = completionPercentage;

    // Render the chart after updating analytics
    renderChart();
}

// Function to render the bar chart
function renderChart() {
    const ctx = analyticsChart.getContext('2d');
    const completionRates = categories.map(category => {
        const categoryTasks = tasks.filter(task => task.categories.includes(category));
        const categoryCompleted = categoryTasks.filter(task => task.completed).length;
        return {
            category,
            completed: (categoryCompleted / (categoryTasks.length || 1)) * 100
        };
    });

    const chartData = {
        labels: completionRates.map(data => data.category),
        datasets: [{
            label: 'Completed Tasks (%)',
            data: completionRates.map(data => data.completed),
            backgroundColor: [
                '#A594F9', // Color for the first bar
                '#CDC1FF', // Color for the second bar
                '#F5EFFF', // Color for the third bar
                '#B1AFFF', // Color for the fourth bar
                '#C4D7FF', // Color for the fifth bar
            ],
        }]
    };

    if (window.myChart) {
        window.myChart.destroy(); // Destroy previous chart instance if it exists
    }

    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            responsive: true,
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}

// Initial render
displayCategories();
displayTasks();
updateAnalytics();