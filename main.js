const form = document.getElementById('my-form');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  console.log("Submitted");

  const container = document.getElementById('attendanceList');
  const selectedDate = document.getElementById('date').value;

  // Check if data exists for the selected date
  axios.get("http://localhost:3000/studentattendance/get-sa")
    .then(res => {
      const dataExists = res.data.some(item => item.date === selectedDate);
      if (dataExists) {
        res.data.forEach(item => {
          if (item.date === selectedDate) {
            showUser(item);
          }
        });
      } else {
        const students = ["Shiva", "Rajesh", "Ashok"];

        students.forEach(student => {
          createAttendanceTracker(student);
        });
        const markBtn = document.createElement('button');
        markBtn.setAttribute('type', 'button');
        markBtn.textContent = 'Mark Attendance';
        markBtn.addEventListener('click', (event) => {
          event.preventDefault();
          console.log("Submitted inside Mark");
          container.style.display = 'none';

          students.forEach(student => {
            // Get the checked radio button value inside the loop
            const rvalue = document.querySelector(`input[name=${student}]:checked`);
            const sval = rvalue ? rvalue.value : null;
            console.log(student, sval);

            const studentLabel = document.createElement('label');
            studentLabel.textContent = student;

            const date = selectedDate;
            console.log(date);
            const name = student;
            const values = sval;
            console.log(`${date} :: ${name} :: ${values} `);

            const obj = {
              date,
              name,
              values
            };
            axios.post("http://localhost:3000/studentattendence/add-sa", obj)
              .then((response) => {
                console.log(response);
                showUser(response.data.newSmDetail);
              })
              .catch((err) => {
                document.body.innerHTML = document.body.innerHTML + "<h4>Something went wrong</h4>"
                console.log(err);
              })
          });
        });

        container.appendChild(markBtn);
        container.appendChild(document.createElement('br'));
      }
    })
    .catch(err => console.log(err));

    function createAttendanceTracker(studentName) {

      // create element
      const studentLabel = document.createElement('label');
      studentLabel.textContent = studentName;
  
      //present-radio
      const presentRadio = document.createElement('input');
      presentRadio.type = 'radio';
      presentRadio.id = `${studentName}_present`;
      presentRadio.name = `${studentName}`;
      presentRadio.value = 'Present'
  
      const presentLabel = document.createElement('label');
      presentLabel.textContent = 'Present';
  
      //absent-radio
      const absentRadio = document.createElement('input');
      absentRadio.type = 'radio';
      absentRadio.id = `${studentName}_absent`;
      absentRadio.name = `${studentName}`;
      absentRadio.value = 'Absent'
  
      const absentLabel = document.createElement('label');
      absentLabel.textContent = 'Absent';
  
  
      container.appendChild(studentLabel);
      container.appendChild(presentRadio);
      container.appendChild(presentLabel);
      container.appendChild(absentRadio);
      container.appendChild(absentLabel);
      container.appendChild(document.createElement('br'));
  
    }

  function showUser(postDetails) {
    const container2 = document.getElementById('totalAtt');

    const studentLabel = document.createElement('label');
    studentLabel.textContent = postDetails.name;

    container2.appendChild(studentLabel);
    container2.appendChild(document.createTextNode(': ' + postDetails.values));
    container2.appendChild(document.createElement('br'));
  }
});

document.getElementById('reportBtn').addEventListener('click', (event) => {
  event.preventDefault();
  axios.get("http://localhost:3000/studentattendance/get-sa")
  .then(res => {
    console.log(res);
      calculateTotalDaysAndPresent(res);
  })
  .catch(err => {
    console.log(err);
  })
})

function calculateTotalDaysAndPresent(info) {
  const totalDays = {};
  const presentDays = {};

  info.data.forEach(entry => {
    const studentName = entry.name;
    const date = entry.date;

    // Update total dates for the student
    if (!totalDays[studentName]) {
      totalDays[studentName] = [];
    }

    // Add date to the array only if it's not already present
    if (!totalDays[studentName].includes(date)) {
      totalDays[studentName].push(date);
    }

    // Update present days for the student if values are 'Present'
    if (entry.values === 'Present') {
      if (!presentDays[studentName]) {
        presentDays[studentName] = 0;
      }
      presentDays[studentName]++;
    }
  });

  // Display the results
  Object.keys(totalDays).forEach(studentName => {
    const totalDates = totalDays[studentName].length;
    const totalPresentDays = presentDays[studentName] || 0;
    var percent = (totalPresentDays / totalDates) * 100;
    var decimal = 0;

    const formattedNumber = percent.toFixed(decimal);

    console.log(`Student: ${studentName}, Total Dates: ${totalDates}, Total Present Days: ${totalPresentDays}`);

    const container3 = document.getElementById('report');

    const studentLabel = document.createElement('label');
    studentLabel.textContent = studentName;

    container3.appendChild(studentLabel);
    container3.appendChild(document.createTextNode(':' + totalPresentDays + ' / ' + totalDates + " => "+ formattedNumber + '%'));
    container3.appendChild(document.createElement('br'));
  });
}
