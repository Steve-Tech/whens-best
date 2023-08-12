let table = document.getElementById('table');
let thead = table.querySelector('thead');
let tbody = table.querySelector('tbody');

let t_wrap = document.getElementById('table-wrap');

let days = document.getElementById('days');

const day_names = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const month_names = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const ranges = { hours: [6, 21] }

let table_date = new Date();

let time_slots = [];

function regenerate_table() {

    let num_days = days.value;
    let tr = document.createElement('tr');

    let date = new Date(table_date);
    for (let i = 0; i < num_days; i++) {
        let th = document.createElement('th');
        th.innerHTML = `${day_names[date.getDay()]}<br><span class="fs-3">${date.getDate()}</span><br>${month_names[date.getMonth()]}`;
        tr.appendChild(th);
        date.setDate(date.getDate() + 1);
    }
    // Clear and re-add the header
    while (thead.firstChild) {
        thead.removeChild(thead.firstChild);
    }
    thead.appendChild(tr);

    // Clear and re-add the body
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }

    for (let i = ranges.hours[0]; i < ranges.hours[1]; i++) {
        let tr = document.createElement('tr');
        {
            let td = document.createElement('td');
            td.innerText = `${(i % 12) || 12} ${i < 12 ? 'AM' : 'PM'}`;
            td.classList.add('pt-0', 'ps-1', 'small');
            tr.appendChild(td);
        }
        for (let j = 1; j < num_days; j++) {
            let td = document.createElement('td');
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
}

days.addEventListener('change', regenerate_table);

function elem_size_resize(e) {
    let value = e.target.value;
    e.target.size = Math.max(value.length + 1, 3);
}

days.addEventListener('input', elem_size_resize);


function edit_time(start_e, curr_e) {
    let time_slot = start_e.target;

    slot_size = time_slot.getBoundingClientRect();
    const start_pos = { x: start_e.clientX - slot_size.left, y: start_e.clientY - slot_size.top}
    const curr_pos = { x: curr_e.clientX - slot_size.left, y: curr_e.clientY - slot_size.top}

    let before_height = parseInt(window.getComputedStyle(time_slot, ':before').height) / 2;
    let after_height = parseInt(window.getComputedStyle(time_slot, ':after').height) / 2;

    let height_per_min = slot_size.height / time_slots[time_slot.dataset.slot].length;

    let start_action;

    if (start_pos.y < before_height) {
        start_action = 'top';
    } else if (start_pos.y > slot_size.height - after_height) {
        start_action = 'bottom';
    } else {
        start_action = 'middle';
    }

    let length = time_slots[time_slot.dataset.slot].length;
    let hour = time_slots[time_slot.dataset.slot].time.getHours();
    let minute = time_slots[time_slot.dataset.slot].time.getMinutes();
    let min_quarter = Math.floor(minute / 15);

    console.log(start_action)

    if (curr_e.movementY < 0) {
        switch (start_action) {
            case 'top':
                time_slots[time_slot.dataset.slot].time.setMinutes(time_slots[time_slot.dataset.slot].time.getMinutes() - 15);
                time_slot.style.top = `${parseInt(time_slot.style.top) - (height_per_min * 15)}px`;
                time_slots[time_slot.dataset.slot].length += 15;
                time_slot.style.height = `${height_per_min * (time_slots[time_slot.dataset.slot].length)}px`;
                break;
            case 'bottom':
                time_slots[time_slot.dataset.slot].length -= 15;
                time_slot.style.height = `${height_per_min * (time_slots[time_slot.dataset.slot].length)}px`;
                break;
            case 'middle':
                break;
        }
    } else if (curr_e.movementY > 0) {
        switch (start_action) {
            case 'top':
                time_slots[time_slot.dataset.slot].time.setMinutes(time_slots[time_slot.dataset.slot].time.getMinutes() + 15);
                time_slot.style.top = `${parseInt(time_slot.style.top) + (height_per_min * 15)}px`;
                time_slots[time_slot.dataset.slot].length -= 15;
                time_slot.style.height = `${height_per_min * (time_slots[time_slot.dataset.slot].length)}px`;
                break;
            case 'bottom':
                time_slots[time_slot.dataset.slot].length += 15;
                time_slot.style.height = `${height_per_min * (time_slots[time_slot.dataset.slot].length)}px`;
                break;
            case 'middle':
                break;
        }
    }

    time_slot.title = `${(hour % 12) || 12}:${minute < 10 ? '0' : ''}${minute} ${hour < 12 ? 'AM' : 'PM'} - ${length} minutes`;

    time_slot.innerText = `${(hour % 12) || 12}:${minute < 10 ? '0' : ''}${minute} ${hour < 12 ? 'AM' : 'PM'}`;

    time_slot.classList.remove('min15');
    time_slot.classList.remove('min30');

    if (length <= 15) {
        time_slot.classList.add('min15');
    } else if (length <= 30) {
        time_slot.classList.add('min30');
    } else if (length >= 60) {
        time_slot.innerText += `\n${length / 60} hour${length != 60 ? 's' : ''}`;
    }

    // console.log(x, y, y - slot_size.height);
}

function create_time(time, length, td) {

    if (td === undefined) {
        let column = Math.ceil((time.getTime() - table_date.getTime()) / (1000 * 60 * 60 * 24));
        td = tbody.children[time.getHours() - ranges.hours[0]].children[column];
    }

    let wrap_size = t_wrap.getBoundingClientRect();

    let td_size = td.getBoundingClientRect();

    let hour = time.getHours();
    let minute = time.getMinutes();
    let min_quarter = Math.floor(minute / 15);

    let time_slot = document.createElement('div');

    time_slot.classList.add('time-slot', 'bg-primary', 'rounded', 'border', 'border-secondary', 'badge', 'px-0', 'text-center');

    // Position styling
    time_slot.style.position = 'absolute';
    time_slot.style.left = `${td_size.left - wrap_size.left}px`;
    time_slot.style.top = `${(td_size.top - wrap_size.top) + min_quarter * (td_size.height / 4)}px`;
    time_slot.style.width = `${td_size.width}px`;
    time_slot.style.height = `${td_size.height / (60 / length)}px`;

    time_slot.title = `${(hour % 12) || 12}:${minute < 10 ? '0' : ''}${minute} ${hour < 12 ? 'AM' : 'PM'} - ${length} minutes`;

    time_slot.innerText = `${(hour % 12) || 12}:${minute < 10 ? '0' : ''}${minute} ${hour < 12 ? 'AM' : 'PM'}`;

    if (length <= 15) {
        time_slot.classList.add('min15');
    } else if (length <= 30) {
        time_slot.classList.add('min30');
    } else if (length >= 60) {
        time_slot.innerText += `\n${length / 60} hour${length != 60 ? 's' : ''}`;
    }

    // time_slot.draggable = true;
    time_slot.addEventListener('mousedown', (e) => {
        edit_event = (new_e) => {
            edit_time(e, new_e);
        };
        document.body.addEventListener('mousemove', edit_event);
        document.body.addEventListener('mouseup', () => {
            document.body.removeEventListener('mousemove', edit_event);
        });
    });

    time_slot.dataset.slot = time_slots.length;

    t_wrap.appendChild(time_slot);

    time_slots.push({ time: time, length: length, elem: time_slot });
}

function create_click(e) {
    if (tbody.contains(e.target) && e.target.tagName == 'TD') {
        let wrap_size = t_wrap.getBoundingClientRect();
        let x = e.clientX - wrap_size.left; //x position within the element.
        let y = e.clientY - wrap_size.top;  //y position within the element.

        if (x > 0 && y > thead.getBoundingClientRect().height) {
            let td = e.target;
            let tr = td.parentElement;

            let td_size = td.getBoundingClientRect();

            let day = Array.from(tr.children).indexOf(td);
            let hour = Array.from(tr.parentElement.children).indexOf(tr) + ranges.hours[0];
            let min_quarter = Math.floor((e.clientY - td_size.top) * 4 / td_size.height);
            let minute = min_quarter * 15;

            let date = new Date(table_date);
            date.setDate(date.getDate() + day);
            date.setHours(hour);
            date.setMinutes(minute);

            create_time(date, 60, td);
        }
    }
}

t_wrap.addEventListener('click', create_click);

elem_size_resize({ target: days });
regenerate_table();