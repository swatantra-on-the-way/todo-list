import "./styles.css";
import {add, format, getOverlappingDaysInIntervals, isMatch} from "date-fns";
import { bg } from "date-fns/locale";
function Element(name){
    const list = [];
    const addItem = item => {
        list.push(item);
        //sort the list based on the title of the todo item
        list.sort((a, b) => compareFn(a.getTitle(), b.getTitle()));
    }
    const deleteItem = item => {
        list.forEach((elem, index) => {
            if (elem === item){
                list.splice(index, 1);
            }
        });
    }
    const isItemFound = item => {
        let isFound = false;
        list.forEach(elem => {
            if (item === elem){
                isFound = true;
            }
        })
        return isFound;
    }
    const getItemsList = () => list;
    const getName = () => name;
    return {addItem, deleteItem, isItemFound, getItemsList, getName};
}

function Project(name){
    let state = {};
    return Object.assign(state, Element(name));
}

function Projects(){
    let projList = [];
    const addProject = proj => projList.push(proj);
    const deleteProject = proj => {
        projList.forEach((elem, index) => {
            if (elem === proj){
                projList.splice(index, 1);
            }
        });
    }
    const getProjList = () => projList;
    return {addProject, deleteProject, getProjList};
}

function TodoItem(title, description, deadline, priority, parentProj, isComplete = false){
    const getTitle = () => title;
    const getDesc = () => description;
    const getDeadline = () => deadline;
    const getPriority = () => priority;
    const getParentProj = () => parentProj;  
    const getCompleteStatus = () => isComplete;  
    const changeCompleteStatus = val => isComplete = val; 
    const updateDetails = (newTitle, newDescription, newDeadline, newPriority, newParentProj) => {
        title = newTitle;
        description = newDescription;
        deadline = newDeadline;
        priority = newPriority;
        parentProj = newParentProj;
    }
    return {getTitle, getDesc, getDeadline, getPriority, getParentProj, getCompleteStatus, changeCompleteStatus, updateDetails};
}

function compareFn(a, b){
    return a < b ? -1 : 1;
}

function AppController(){
    const ItemRoot = Element();
    const Home = Element("Home");
    const Today = Element("Today");
    const Tomorrow = Element("Tomorrow");
    const Priority = Element("Priority");
    const Completed = Element("Completed");
    const ProjectRoot = Projects();

    const elementArray = [Home, Today, Tomorrow, Priority];

    const todayDate = format(new Date(), "yyyy-MM-dd");
    const tomorrowDate = format(add(new Date(), {days: 1}), "yyyy-MM-dd");

    const updateProjectStorage = () => {
        localStorage.setItem('projList', JSON.stringify(ProjectRoot.getProjList().map(proj => proj.getName())));
    }
    const updateItemStorage = () => {
        localStorage.setItem('itemList', JSON.stringify(ItemRoot.getItemsList().map(item => ({
            title: item.getTitle(),
            description: item.getDesc(),
            deadline: item.getDeadline(),
            priority: item.getPriority(), 
            parentProj: item.getParentProj(), 
            isComplete: item.getCompleteStatus(),
        }))));
    }
    const findProject = projName => {
        return ProjectRoot.getProjList().filter(proj => {
            return proj.getName() === projName;
        })[0];
    }

    const checkForNameMatch = projName => {
        let isMatch = false;
        ProjectRoot.getProjList().forEach(proj => {
            if (proj.getName() === projName){
                isMatch = true;
            }
        })
        return isMatch;
    }

    const createProject = name => {
        if (checkForNameMatch(name)){
            alert("Two projects cannot have the same name!!!");
            return 0;
        }
        const proj = Project(name);
        ProjectRoot.addProject(proj);
        updateProjectStorage();
        return proj;
    }

    const removeProject = proj => {
        ProjectRoot.deleteProject(proj);
        if (proj.getItemsList()) {
            proj.getItemsList().forEach(item => removeItem(item));
        }
        updateProjectStorage();
    }

    const createItem = (title, description, deadline, priority, parentProj) => {
        const item = TodoItem(title, description, deadline, priority, parentProj);
        addToElements(item);
        updateItemStorage();
        return item;
    }

    const addToElements = item => {
        if (!item.getCompleteStatus()){
            ItemRoot.addItem(item);
        }

        Home.addItem(item);
        //find the parent project based on the string value i.e. name
        let proj = findProject(item.getParentProj());
        proj.addItem(item);
        if (todayDate === item.getDeadline()){
            Today.addItem(item);
        }
        else if (tomorrowDate === item.getDeadline()){
            Tomorrow.addItem(item);
        }
        if (item.getPriority() === "1"){
            Priority.addItem(item);
        }
    }
                  
    //Deletes item permanently
    const removeItem = item => {
        ItemRoot.deleteItem(item);
        clearItemFromElements(item);
        updateItemStorage();
    }

    //Removes item from Elements, item is still in ItemRoot
    const clearItemFromElements = item => {
        Home.deleteItem(item);
        if (findProject(item.getParentProj())){
            findProject(item.getParentProj()).deleteItem(item);
        }
        if (Today.isItemFound(item)){
            Today.deleteItem(item);
        }
        else if (Tomorrow.isItemFound(item)){
            Tomorrow.deleteItem(item);
        }
        if (Priority.isItemFound(item)){
            Priority.deleteItem(item);
        }

        if (Completed.isItemFound(item)){
            Completed.deleteItem(item);
        }
    }

    const editItem = (item, newTitle, newDescription, newDeadline, newPriority, newParentProj) => {
        if (newDeadline !== item.getDeadline()){
            console.log(`new Deadline is ${newDeadline} and its type is ${typeof newDeadline}`);

            console.log(`previous saved deadline of item is ${item.getDeadline()} and its type is ${typeof item.getDeadline()}`);
            if (Today.isItemFound(item)){
                Today.deleteItem(item);
            }
            else if (Tomorrow.isItemFound(item)){
                Tomorrow.deleteItem(item);
            }

            if (newDeadline === todayDate){
                Today.addItem(item);
                
            }
            else if (newDeadline === tomorrowDate){
                Tomorrow.addItem(item);
            }
        }

        if (newPriority !== item.getPriority()){
            if (newPriority === "1"){
                Priority.addItem(item);
            }
            else {
                Priority.deleteItem(item);
            }
        }

        if (item.getParentProj() !== newParentProj){
            let proj = findProject(newParentProj);
            proj.addItem(item);
            findProject(item.getParentProj()).deleteItem(item);
        }
        
        findProject(newParentProj).getItemsList().sort((a, b) => compareFn(a.getTitle(), b.getTitle()));
        elementArray.forEach(elem => elem.getItemsList().sort((a, b) => compareFn(a.getTitle(), b.getTitle())));
        item.updateDetails(newTitle, newDescription, newDeadline, newPriority, newParentProj);
        updateItemStorage();
    }

    const markAsComplete = item => {
        clearItemFromElements(item);
        item.changeCompleteStatus(true);
        Completed.addItem(item);
        updateItemStorage();
    }

    const markAsIncomplete = item => {
        addToElements(item);
        item.changeCompleteStatus(false);
        Completed.deleteItem(item);
        updateItemStorage();
    }

    //If localStorage is empty, create a 'Default' project
    if(!localStorage.getItem('projList')){
        createProject("Default");
    }

    else{
        const projList = JSON.parse(localStorage.getItem('projList'));
        projList.forEach(proj => createProject(proj));
    }

    //Check if there is already a todo item in localStorage
    if (localStorage.getItem('itemList')){
        const itemList = JSON.parse(localStorage.getItem('itemList'));
        itemList.forEach(item => {
            let tmp = createItem(item.title, item.description, item.deadline, item.priority, item.parentProj, item.isComplete);
            if (item.isComplete){
                markAsComplete(tmp);
            }
        });
    }
    return {ItemRoot, Home, Today, Tomorrow, Priority, Completed, ProjectRoot, createProject, removeProject, createItem, removeItem, editItem, markAsComplete, markAsIncomplete, findProject};
}

function ScreenController(){
    const app = AppController();
    const elementArray = [app.Home, app.Today, app.Tomorrow, app.Priority, app.Completed];
    let currActiveTab = elementArray[0];

    const switchActiveTab = (tab) => {
        currActiveTab = tab;
    }
    const updateItemCount = () => {
        const countElement = document.querySelectorAll(".item-count");
        countElement.forEach((elem, index) => {
            elem.innerText = elementArray[index].getItemsList().length;
        });
    }

    const makeNavElemInteract = () => {
        const navElement = document.querySelectorAll("#navbar button");
        navElement.forEach((elem, index) => {
            elem.addEventListener("click", (e) => {
                switchActiveTab(elementArray[index]);
                renderActiveTabContent();
                updateItemCount();
            });
        });

    }

    const displayCompletedTasks = () => {
        const todoListsContainer = document.querySelector("#todo-list");
        const itemsList = currActiveTab.getItemsList();
        itemsList.forEach(item => {
            const itemContainer = document.createElement("div");
            const markIncompleteBtn = document.createElement("button");
            markIncompleteBtn.innerText = "Mark Incomplete";
            const itemTitle = document.createElement("p");
            itemTitle.innerText = item.getTitle();
            const delBtn = document.createElement("button");
            delBtn.innerText = "Delete";

            itemContainer.classList.add("comp-item-container");
            markIncompleteBtn.classList.add("mark-incomplete-btn");
            itemTitle.classList.add("comp-item-title");
            delBtn.classList.add("comp-item-delete-btn");

            itemContainer.appendChild(markIncompleteBtn);
            itemContainer.appendChild(itemTitle);
            itemContainer.appendChild(delBtn);

            markIncompleteBtn.addEventListener("click", () => {
                app.markAsIncomplete(item);
                updateItemCount();
                renderActiveTabContent();
            });

            delBtn.addEventListener("click", () => {
                app.removeItem(item);
                updateItemCount();
                renderActiveTabContent();
            });
            todoListsContainer.appendChild(itemContainer);
        });
    }

    function addProjListToModal(dialog){
        const projList = app.ProjectRoot.getProjList();
        const projSelect = dialog.querySelector(".project-select");
        projSelect.innerText = "";
    
        if (dialog.id === "add-todo-dialog"){
            const option = document.createElement("option");
            option.value = "";
            option.innerText = "Choose a Project";
            projSelect.appendChild(option);
        }
        projList.forEach(proj => {
            const option = document.createElement("option");
            option.innerText = proj.getName();
            option.value = proj.getName();
            projSelect.appendChild(option);
        });
    }

    const expandTodoItem = (item) => {
        const expandedTodoModal = document.querySelector("#update-todo-dialog");
        const titleBox = document.querySelector("#title2");
        const descBox = document.querySelector("#description2");
        const deadlineBox = document.querySelector("#deadline2");
        const priorityBox = document.querySelector("#priority-select2");
        const projBox = document.querySelector("#project-select2");
        const cancelBtn = expandedTodoModal.querySelector(".cancel");

        titleBox.value = item.getTitle();
        descBox.value = item.getDesc();
        deadlineBox.value = item.getDeadline();
        priorityBox.value = item.getPriority();
        projBox.value = item.getParentProj();
        addProjListToModal(expandedTodoModal);

        projBox.value = item.getParentProj();

        cancelBtn.addEventListener("click", (e) => {
            e.preventDefault();
            expandedTodoModal.close();
        });

        expandedTodoModal.addEventListener("submit", (e) => {
            e.preventDefault();
            app.editItem(item, titleBox.value, descBox.value, deadlineBox.value, priorityBox.value, projBox.value);
            expandedTodoModal.close();
            updateItemCount();
            renderActiveTabContent();
        });

        expandedTodoModal.showModal();
    }

    const displayPendingTasks = () => {
        const todoListsContainer = document.querySelector("#todo-list");
        const itemsList = currActiveTab.getItemsList();
        itemsList.forEach(item => {
            const itemContainer = document.createElement("div");
            itemContainer.role = "button";
            itemContainer.tabindex = "0";
            const markCompleteBtn = document.createElement("button");
            markCompleteBtn.innerText = "Mark Complete";
            const itemInfo = document.createElement("div");
            const itemTitle = document.createElement("p");
            itemTitle.innerText = item.getTitle();
            const itemDeadline = document.createElement("p");
            itemDeadline.innerText = item.getDeadline();
            itemInfo.appendChild(itemTitle);
            itemInfo.appendChild(itemDeadline);
            const delBtn = document.createElement("button");
            delBtn.innerText = "Delete";

            itemContainer.classList.add("item-container");
            markCompleteBtn.classList.add("mark-complete-btn");
            itemInfo.classList.add("item-info");
            delBtn.classList.add("item-delete-btn");

            itemContainer.appendChild(markCompleteBtn);
            itemContainer.appendChild(itemInfo);
            itemContainer.appendChild(delBtn);

            itemContainer.addEventListener("click", (e) => {
                if (e.target.classList.contains("mark-complete-btn")){
                    console.log(e.target);
                    console.log(currActiveTab.getName());
                    app.markAsComplete(item);
                }

                else if (e.target.classList.contains("item-delete-btn")){
                    console.log("delete button of incomplete item clicked");
                    app.removeItem(item);
                }
                else {
                    expandTodoItem(item);
                }
                updateItemCount();
                renderActiveTabContent();
            });
            todoListsContainer.appendChild(itemContainer);
        });
    }

    const clearTodoListArea = () => {
        const todoListsContainer = document.querySelector("#todo-list");
        todoListsContainer.innerText = "";
    }

    function renderActiveTabContent(){
        clearTodoListArea();
        console.log(`current active tab is ${currActiveTab.getName()}`);
        if (currActiveTab.getItemsList().length  === 0){
            const todoListsContainer = document.querySelector("#todo-list");
            todoListsContainer.innerText = "No any items to display mf";
            todoListsContainer.innerText += "    " +  currActiveTab.getName();
        }
        else if (currActiveTab === app.Completed){
            displayCompletedTasks();
        }
        else {
            displayPendingTasks();
        }
    }

    const displayProjects = () => {
        const projList = app.ProjectRoot.getProjList();
        const projListContainer = document.querySelector("#proj-list");
        projListContainer.innerText = "";
        projList.forEach(proj => {
            const projContainer = document.createElement("div");
            projContainer.classList.add("project");
            projContainer.role = "button";
            projContainer.tabindex = "0";
            const projName = document.createElement("p");
            projName.classList.add("proj-name");
            projName.innerText = proj.getName();
            projContainer.appendChild(projName);

            if (proj.getName() !== "Default"){
                const deleteIcon = document.createElement("button");
                deleteIcon.classList.add("del-proj-btn");
                deleteIcon.innerText = "Delete";
                projContainer.appendChild(deleteIcon);
            }
            projContainer.addEventListener("click", (e) => {
                if (e.target.classList.contains("del-proj-btn")){
                    proj.getItemsList().forEach(item => app.removeItem(item));
                    app.removeProject(proj);
                    if (currActiveTab === proj){
                        switchActiveTab(app.Home);
                    }
                    updateItemCount();
                    displayProjects();
                }
                else {
                    switchActiveTab(proj);
                }
                renderActiveTabContent();
            });
            projListContainer.appendChild(projContainer);
        });
    }


    const setupProjectCreation = () => {
        const createProjBtn = document.querySelector("#create-proj-btn");
        const addProjDialog = document.querySelector("#add-proj-dialog");
        const inputValueDialog = document.querySelector("#add-proj-input");
        const cancelProjBtn = document.querySelector("#cancel-proj");

        createProjBtn.addEventListener("click", () => addProjDialog.showModal());

        cancelProjBtn.addEventListener("click", (e) => {
            e.preventDefault();
            addProjDialog.close();
        });

        addProjDialog.addEventListener("submit", (e) => {
            e.preventDefault();
            if (app.createProject(inputValueDialog.value)){
                displayProjects();
                addProjDialog.close();
            }   
        });
    }
    const setupTodoCreation = () => {

        const addTodoBtn = document.querySelector("#add-todo-btn");
        const addTodoDialog = document.querySelector("#add-todo-dialog");
        const cancelTodoBtn = document.querySelector("#add-todo-dialog .cancel");

        addTodoBtn.addEventListener("click", () => {
            addProjListToModal(addTodoDialog);
            addTodoDialog.showModal();
        });

        addTodoDialog.addEventListener("submit", (e) => {
            e.preventDefault();
            const titleBox = document.querySelector("#title1");
            const descBox = document.querySelector("#description1");
            const deadlineBox = document.querySelector("#deadline1");
            const priorityBox = document.querySelector("#priority-select1");
            const projBox = document.querySelector("#project-select1");
            app.createItem(titleBox.value, descBox.value, deadlineBox.value, priorityBox.value, projBox.value);
            updateItemCount();
            renderActiveTabContent();
            addTodoDialog.close();
        });

        cancelTodoBtn.addEventListener("click", (e) => {
            e.preventDefault();
            addTodoDialog.close();
            
        });
    }


    makeNavElemInteract();
    updateItemCount();
    displayProjects();
    setupProjectCreation();
    setupTodoCreation();
    renderActiveTabContent();
}

ScreenController();










