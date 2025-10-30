// script.js

class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.editingTaskId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.render();
    }
    
    // 初始化 DOM 元素引用
    initializeElements() {
        this.taskForm = document.getElementById('taskForm');
        this.taskInput = document.getElementById('taskInput');
        this.taskList = document.getElementById('taskList');
        this.taskCount = document.getElementById('taskCount');
        this.filterButtons = document.querySelectorAll('.filter-btn');
    }
    
    // 绑定事件监听器
    bindEvents() {
        // 表单提交
        this.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddTask();
        });
        
        // 筛选按钮
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleFilterChange(e.target.dataset.filter);
            });
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter' && this.taskInput.value.trim()) {
                this.handleAddTask();
            }
        });
    }
    
    // 从本地存储加载任务
    loadTasks() {
        try {
            const tasks = localStorage.getItem('todoTasks');
            return tasks ? JSON.parse(tasks) : [];
        } catch (error) {
            console.error('加载任务失败:', error);
            return [];
        }
    }
    
    // 保存任务到本地存储
    saveTasks() {
        try {
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('保存任务失败:', error);
        }
    }
    
    // 处理添加任务
    handleAddTask() {
        const text = this.taskInput.value.trim();
        
        if (!text) {
            this.showNotification('请输入任务内容', 'error');
            return;
        }
        
        if (this.editingTaskId) {
            // 编辑现有任务
            this.updateTask(this.editingTaskId, text);
            this.editingTaskId = null;
            this.addTaskBtn.textContent = '添加';
        } else {
            // 添加新任务
            const task = {
                id: Date.now().toString(),
                text: text,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            this.tasks.unshift(task);
            this.showNotification('任务添加成功');
        }
        
        this.taskInput.value = '';
        this.saveTasks();
        this.render();
    }
    
    // 更新任务
    updateTask(id, newText) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.text = newText;
            this.showNotification('任务更新成功');
        }
    }
    
    // 切换任务完成状态
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }
    
    // 删除任务
    deleteTask(id) {
        if (confirm('确定要删除这个任务吗？')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.render();
            this.showNotification('任务已删除');
        }
    }
    
    // 开始编辑任务
    startEditTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.taskInput.value = task.text;
            this.editingTaskId = id;
            this.addTaskBtn.textContent = '更新';
            this.taskInput.focus();
        }
    }
    
    // 处理筛选变化
    handleFilterChange(filter) {
        this.currentFilter = filter;
        
        // 更新活跃的筛选按钮
        this.filterButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.filter === filter);
        });
        
        this.render();
    }
    
    // 获取筛选后的任务
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }
    
    // 显示通知
    showNotification(message, type = 'success') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'error' ? '#ef4444' : '#10b981'};
            color: white;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // 3秒后移除通知
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // 渲染任务列表
    render() {
        const filteredTasks = this.getFilteredTasks();
        
        // 更新任务计数
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.completed).length;
        this.taskCount.textContent = `${completedTasks} / ${totalTasks} 完成`;
        
        // 清空当前列表
        this.taskList.innerHTML = '';
        
        // 空状态处理
        if (filteredTasks.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <h3>${this.getEmptyStateMessage()}</h3>
                <p>${this.getEmptyStateDescription()}</p>
            `;
            this.taskList.appendChild(emptyState);
            return;
        }
        
        // 渲染任务项
        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.taskList.appendChild(taskElement);
        });
    }
    
    // 获取空状态消息
    getEmptyStateMessage() {
        switch (this.currentFilter) {
            case 'active':
                return '没有进行中的任务';
            case 'completed':
                return '没有已完成的任务';
            default:
                return '还没有任何任务';
        }
    }
    
    // 获取空状态描述
    getEmptyStateDescription() {
        switch (this.currentFilter) {
            case 'active':
                return '所有任务都已完成！';
            case 'completed':
                return '开始完成任务吧！';
            default:
                return '添加你的第一个任务开始吧！';
        }
    }
    
    // 创建任务元素
    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.setAttribute('data-task-id', task.id);
        
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''}
            >
            <span class="task-text">${this.escapeHtml(task.text)}</span>
            <div class="task-actions">
                <button class="edit-btn" type="button">编辑</button>
                <button class="delete-btn" type="button">删除</button>
            </div>
        `;
        
        // 绑定事件
        const checkbox = li.querySelector('.task-checkbox');
        const editBtn = li.querySelector('.edit-btn');
        const deleteBtn = li.querySelector('.delete-btn');
        
        checkbox.addEventListener('change', () => this.toggleTask(task.id));
        editBtn.addEventListener('click', () => this.startEditTask(task.id));
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
        
        return li;
    }
    
    // HTML 转义，防止 XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // 获取任务统计
    getStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        return { total, completed, pending };
    }
}

// 添加一些 CSS 动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .task-item {
        transition: all 0.3s ease;
    }
    
    .task-item.removing {
        opacity: 0;
        transform: translateX(-100%);
    }
`;
document.head.appendChild(style);

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});