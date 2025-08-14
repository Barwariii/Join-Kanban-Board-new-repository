function noTaskTemplate(category) {
    return `
    <div class="noToDoContainer">
      <span class="noToDoText">No tasks in ${category}</span>
    </div>`;
}

// Task Template
//! Tickets render Template noch fertig mit den Daten machen und gucken wie das mit Subtasks etc. am besten gemacht wird
function taskTemplate(task, userData) {
    if (!Array.isArray(userData)) {
        userData = [];
    }
    // Calculate the progress in the subtasks
    const completed = task.subtasks?.filter(s => s.completed).length || 0;
    const total = task.subtasks?.length || 0;
    // Calculate the bar width (SVG width 180)
    const progressBarWidth = total > 0 ? (completed / total) * 180 : 0;

    // Render the assigned contacts (assigned_to)
    const assignedContacts = (task.assigned_to || [])
        .map(id => {
            const user = userData.find(u => u.id === id);
            if (!user) return '';
            return `<div class="taskSingleContact" style="background-color:${user.color}">
                        <span>${user.initials}</span>
                    </div>`;
        }).join('');

    function getPrioritySVG(priority) {
        if (priority === "urgent") {
            //  Urgent
            return `<svg width="21" height="15" viewBox="0 0 21 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.9041 14.7547C18.6695 14.7551 18.441 14.6803 18.2521 14.5412L10 8.458L1.74797 14.5412C1.63212 14.6267 1.50054 14.6887 1.36073 14.7234C1.22093 14.7582 1.07565 14.7651 0.933183 14.7437C0.790715 14.7223 0.653851 14.6732 0.530406 14.599C0.406961 14.5247 0.299352 14.427 0.213723 14.3112C0.128094 14.1954 0.0661217 14.0639 0.031345 13.9243C-0.00343163 13.7846 -0.0103318 13.6394 0.0110384 13.497C0.0541974 13.2095 0.209888 12.9509 0.44386 12.7781L9.34797 6.20761C9.53667 6.06802 9.76524 5.99268 10 5.99268C10.2348 5.99268 10.4634 6.06802 10.6521 6.20761L19.5562 12.7781C19.7421 12.915 19.88 13.1071 19.9501 13.327C20.0203 13.5469 20.0191 13.7833 19.9468 14.0025C19.8745 14.2216 19.7348 14.4124 19.5475 14.5475C19.3603 14.6826 19.1351 14.7551 18.9041 14.7547Z" fill="#FF3D00" />
                <path d="M18.9042 9.00568C18.6695 9.00609 18.441 8.93124 18.2521 8.79214L10.0001 2.70898L1.748 8.79214C1.51403 8.96495 1.22095 9.0378 0.933218 8.99468C0.645491 8.95155 0.386693 8.79597 0.213758 8.56218C0.0408221 8.32838 -0.0320856 8.03551 0.0110734 7.74799C0.0542325 7.46048 0.209923 7.20187 0.443895 7.02906L9.348 0.458588C9.5367 0.318997 9.76528 0.243652 10.0001 0.243652C10.2348 0.243652 10.4634 0.318997 10.6521 0.458588L19.5562 7.02906C19.7421 7.16598 19.88 7.35809 19.9502 7.57797C20.0203 7.79785 20.0192 8.03426 19.9469 8.25344C19.8746 8.47262 19.7348 8.66338 19.5476 8.79847C19.3603 8.93356 19.1351 9.00608 18.9042 9.00568Z" fill="#FF3D00" />
                <path d="M18.9041 14.7547C18.6695 14.7551 18.441 14.6803 18.2521 14.5412L10 8.458L1.74797 14.5412C1.63212 14.6267 1.50054 14.6887 1.36073 14.7234C1.22093 14.7582 1.07565 14.7651 0.933183 14.7437C0.790715 14.7223 0.653851 14.6732 0.530406 14.599C0.406961 14.5247 0.299352 14.427 0.213723 14.3112C0.128094 14.1954 0.0661217 14.0639 0.031345 13.9243C-0.00343163 13.7846 -0.0103318 13.6394 0.0110384 13.497C0.0541974 13.2095 0.209888 12.9509 0.44386 12.7781L9.34797 6.20761C9.53667 6.06802 9.76524 5.99268 10 5.99268C10.2348 5.99268 10.4634 6.06802 10.6521 6.20761L19.5562 12.7781C19.7421 12.915 19.88 13.1071 19.9501 13.327C20.0203 13.5469 20.0191 13.7833 19.9468 14.0025C19.8745 14.2216 19.7348 14.4124 19.5475 14.5475C19.3603 14.6826 19.1351 14.7551 18.9041 14.7547Z" fill="#FF3D00" />
                <path d="M18.9042 9.00568C18.6695 9.00609 18.441 8.93124 18.2521 8.79214L10.0001 2.70898L1.748 8.79214C1.51403 8.96495 1.22095 9.0378 0.933218 8.99468C0.645491 8.95155 0.386693 8.79597 0.213758 8.56218C0.0408221 8.32838 -0.0320856 8.03551 0.0110734 7.74799C0.0542325 7.46048 0.209923 7.20187 0.443895 7.02906L9.348 0.458588C9.5367 0.318997 9.76528 0.243652 10.0001 0.243652C10.2348 0.243652 10.4634 0.318997 10.6521 0.458588L19.5562 7.02906C19.7421 7.16598 19.88 7.35809 19.9502 7.57797C20.0203 7.79785 20.0192 8.03426 19.9469 8.25344C19.8746 8.47262 19.7348 8.66338 19.5476 8.79847C19.3603 8.93356 19.1351 9.00608 18.9042 9.00568Z" fill="#FF3D00" />
                </svg>`;
        } else if (priority === "medium") {
            //  Medium 
            return `<svg width="20" height="9" viewBox="0 0 20 9" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_50926_984)">
                <path d="M18.9041 8.22528H1.09589C0.805242 8.22528 0.526498 8.10898 0.320979 7.90197C0.11546 7.69495 0 7.41419 0 7.12143C0 6.82867 0.11546 6.5479 0.320979 6.34089C0.526498 6.13388 0.805242 6.01758 1.09589 6.01758H18.9041C19.1948 6.01758 19.4735 6.13388 19.679 6.34089C19.8845 6.5479 20 6.82867 20 7.12143C20 7.41419 19.8845 7.69495 19.679 7.90197C19.4735 8.10898 19.1948 8.22528 18.9041 8.22528Z" fill="#ffa800"/>
                <path d="M18.9041 2.98211H1.09589C0.805242 2.98211 0.526498 2.86581 0.320979 2.6588C0.11546 2.45179 0 2.17102 0 1.87826C0 1.5855 0.11546 1.30474 0.320979 1.09772C0.526498 0.890712 0.805242 0.774414 1.09589 0.774414L18.9041 0.774414C19.1948 0.774414 19.4735 0.890712 19.679 1.09772C19.8845 1.30474 20 1.5855 20 1.87826C20 2.17102 19.8845 2.45179 19.679 2.6588C19.4735 2.86581 19.1948 2.98211 18.9041 2.98211Z" fill="#ffa800"/>
            </g>
            <defs>
                <clipPath id="clip0_50926_984">
                    <rect width="20" height="7.45098" fill="white" transform="translate(0 0.774414)"/>
                </clipPath>
            </defs>
        </svg>`;
        } else {
            //  Low 
            return `<svg width="21" height="15" viewBox="0 0 21 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.5 9.00614C10.2654 9.00654 10.0369 8.9317 9.84802 8.79262L0.944913 2.22288C0.829075 2.13733 0.731235 2.02981 0.65698 1.90647C0.582724 1.78313 0.533508 1.64638 0.51214 1.50404C0.468986 1.21655 0.541885 0.923717 0.714802 0.689945C0.887718 0.456173 1.14649 0.300615 1.43418 0.257493C1.72188 0.21437 2.01493 0.287216 2.24888 0.460004L10.5 6.54248L18.7511 0.460004C18.867 0.374448 18.9985 0.312529 19.1383 0.277782C19.2781 0.243035 19.4234 0.236141 19.5658 0.257493C19.7083 0.278844 19.8451 0.328025 19.9685 0.402225C20.092 0.476425 20.1996 0.574193 20.2852 0.689945C20.3708 0.805697 20.4328 0.937168 20.4676 1.07685C20.5023 1.21653 20.5092 1.36169 20.4879 1.50404C20.4665 1.64638 20.4173 1.78313 20.343 1.90647C20.2688 2.02981 20.1709 2.13733 20.0551 2.22288L11.152 8.79262C10.9631 8.9317 10.7346 9.00654 10.5 9.00614Z" fill="#7AE229"/>
            <path d="M10.5 14.7547C10.2654 14.7551 10.0369 14.6802 9.84802 14.5412L0.944913 7.97142C0.710967 7.79863 0.555294 7.54005 0.51214 7.25257C0.468986 6.96509 0.541886 6.67225 0.714802 6.43848C0.887718 6.20471 1.14649 6.04915 1.43418 6.00603C1.72188 5.96291 2.01493 6.03575 2.24888 6.20854L10.5 12.291L18.7511 6.20854C18.9851 6.03575 19.2781 5.96291 19.5658 6.00603C19.8535 6.04915 20.1123 6.20471 20.2852 6.43848C20.4581 6.67225 20.531 6.96509 20.4879 7.25257C20.4447 7.54005 20.289 7.79863 20.0551 7.97142L11.152 14.5412C10.9631 14.6802 10.7346 14.7551 10.5 14.7547Z" fill="#7AE229"/>
        </svg>`;
        }
    }


    return `
    <div id="${task.id}" class="taskSingleCard" draggable="true"
      ondragstart="startDraggingElement('${task.id}'); addClassForRotation('${task.id}')"
      ondragend="removeClassForRotation('${task.id}')"
    >
    <div class="taskSingleCardContentWrapper">
        <div class="taskTypeContainer">
            <div id="taskTypeTextContainer" class="technicalTaskBG">
                <span id="taskTypeText">${task.type}</span>
            </div>
            <div class="task-btns">
                <span onclick="openEditTaskOverlay('${task.id}')" id="editTaskBtn" class="edit-task-btn">edit</span>
                <span onclick="deleteTask('${task.id}')" id="deleteTaskBtn" class="delete-task-btn">delete</span>
            </div>
        </div>

        <div class="taskTitleAndDescriptionContainer">
            <div class="taskTitleContainer">
                <span id="taskTitleText">${task.title}</span>
            </div>
            <div class="taskDescriptionContainer">
                <span id="taskDescriptionText">${task.description}</span>
            </div>
        </div>

        <div class="taskProgressbarContainer">
            <div class="taskProgressbarSVGContainer">
                <svg width="180" height="16" viewBox="0 0 180 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="180" height="16" rx="8" fill="#F4F4F4" />
                    <rect width="${progressBarWidth}" height="16" rx="8" fill="#4589FF" />
                </svg>
            </div>
            <div class="taskProgressbarStatusTextContainer">
                <span id="taskProgressbarStatusText">${completed}/${total} Subtasks</span>
            </div>
        </div>

        <div class="taskAssignedToAndPriorityContainer">
            <div id="taskAssignedToContainer" class="taskAssignedToContainer">
                ${assignedContacts}
            </div>
<div id="taskPriorityContainer" class="taskPriorityContainer">
    <div class="taskPrioritySVGContainer">
        ${getPrioritySVG(task.priority)}
    </div>
</div>

        </div>
    </div>
    </div >
    `;
}


// Technical Task Overlay
function technicalTaskOverlayTemplate() {
    return /*html*/`
        < div class="overlayForTechnicalTask" >
                        <div class="upperOverlayContainer">
                            <div class="technicalTaskPlusCross">
                                <div class="technicalTask">
                                    <p>Technical Task</p>
                                </div>
                                <div class="corssImgIcon">
                                    <img src="../assets/icons/close_blue.svg">
                                </div>
                            </div>
                            <div class="titleField">
                                <span>Title is standing here</span>
                            </div>
                            <div class="buildDatePriority">
                                <div class="build">
                                    <span>Build start Page Text</span>
                                </div>
                                <div class="date">
                                    <span>Due Date :</span>
                                </div>
                                <div class="priority">
                                    <span>Priority :</span>
                                </div>
                            </div>
                        </div>
                        <div class="lowerOverlayContainer">
                            <div class="assignedAndName">
                                <div class="assign">
                                    <span>Assigned To :</span>
                                </div>
                                <div class="namesForOverlay">
                                    <div class="circleAndName">
                                        <div class="circleForOverlayUserStory">
                                            TN
                                        </div>
                                        <div>
                                            <span>Test name</span>
                                        </div>
                                    </div>
                                    <div class="circleAndName">
                                        <div class="circleForOverlayUserStory">
                                            TN
                                        </div>
                                        <div>
                                            <span>Text name</span>
                                        </div>
                                    </div>
                                </div>
    
                            </div>
                            <div class="subTasksAndDeleteEdit">
                                <div class="subtasks">
                                    <span>Subtasks :</span>
                                    <div class="cubeWithHook">
                                        <img src="../assets/icons/Rectangle_with.svg">
                                    </div>
                                    <div class="cubeWithoutHook">
                                        <img src="../assets/icons/Rectangle_without.svg">
                                    </div>
                                </div>
                                <div class="deleteAndEditOverlay">
                                        <div class="deleteImgIcon">
                                            <img src="../assets/icons/delete.svg">
                                            <span>Delete</span>
                                        </div>
                                        <div class="separationDiv"></div>
                                        <div class="editImgIcon">
                                            <img src="../assets/icons/edit.svg"> 
                                            <span>Edit</span>
                                        </div>
                                </div>
                            </div>
                        </div>
                    </ >
        `;
}


// User Story Overlay
function userStoryOverlayTemplate() {
    return /*html*/`
        < div class="overlayForUserStory" >
                    <div class="upperOverlayContainer">
                        <div class="userstoryPlusCross">
                            <div class="userstory">
                                <p>User Story</p>
                            </div>
                            <div class="corssImgIcon">
                                <img src="../assets/icons/close_blue.svg">
                            </div>
                        </div>
                        <div class="titleField">
                            <span>Title is standing here</span>
                        </div>
                        <div class="buildDatePriority">
                            <div class="build">
                                <span>Build start Page Text</span>
                            </div>
                            <div class="date">
                                <span>Due Date :</span>
                            </div>
                            <div class="priority">
                                <span>Priority :</span>
                            </div>
                        </div>
                    </div>
                    <div class="lowerOverlayContainer">
                        <div class="assignedAndName">
                            <div class="assign">
                                <span>Assigned To :</span>
                            </div>
                            <div class="namesForOverlay">
                                <div class="circleAndName">
                                    <div class="circleForOverlayUserStory">
                                        TN
                                    </div>
                                    <div>
                                        <span>Test name</span>
                                    </div>
                                </div>
                                <div class="circleAndName">
                                    <div class="circleForOverlayUserStory">
                                        TN
                                    </div>
                                    <div>
                                        <span>Text name</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="subTasksAndDeleteEdit">
                            <div class="subtasks">
                                <span>Subtasks :</span>
                                <div class="cubeWithHook">
                                    <img src="../assets/icons/Rectangle_with.svg">
                                </div>
                                <div class="cubeWithoutHook">
                                    <img src="../assets/icons/Rectangle_without.svg">
                                </div>
                            </div>
                            <div class="deleteAndEditOverlay">
                                    <div class="deleteImgIcon">
                                        <img src="../assets/icons/delete.svg">
                                        <span>Delete</span>
                                    </div>
                                    <div class="separationDiv"></div>
                                    <div class="editImgIcon">
                                        <img src="../assets/icons/edit.svg"> 
                                        <span>Edit</span>
                                    </div>
                            </div>
                        </div>
                    </div>
                </ >
        `;
}