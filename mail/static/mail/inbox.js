document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Send mail
  document.querySelector('form').onsubmit = () => {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value,
      }),
    })
    .then(response => response.json())
    .then(result => {
      load_mailbox('inbox');
    });
  };
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`;

  // Fetch for correct mails
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(data => {
    data.forEach(element => {
      mail = document.createElement('div');
      mail.classList.add('mail-item');
      mail.id = element.id
      mail.innerHTML = `<span style="float:left;"> ${element.sender}</span> ${element.subject} <span style="float:right;">${element.timestamp}</span>`;
      document.querySelector('#emails-view').append(mail);

      // Read email
      if (element.read === true) {
        mail.style.background = 'lightgray';
      }
    });

    // Viewing email
    document.querySelectorAll('.mail-item').forEach(item => {
      item.onclick = () => {
        view_email(item.id);
      }
    });

  });

  //       // Removes inbox divs
  //       document.querySelectorAll('.mail-item, h3, #archive').forEach(e => e.remove());
  //       // Fetch for the mail's data
  //       fetch(`emails/${element.id}`)
  //       .then(response => response.json())
  //       .then(data => {
  //         viewMail = document.createElement('div');

  //         // Email information
  //         for (key in data) {
  //           if (key === 'id' || key === 'read' || key === 'archived' || key === 'body') {
  //             continue;
  //           }
  //           info = document.createElement('div');
  //           if (key === 'sender') {
  //             info.innerHTML = `<b>From:</b> ${data[key]}`;
  //           } else if (key === 'recipients') {
  //             info.innerHTML = `<b>To:</b> ${data[key]}`;
  //           } else if (key === 'subject'){
  //             info.innerHTML = `<b>Subject:</b> ${data[key]}`;
  //           } else {
  //             info.innerHTML = `<b>Timestamp:</b> ${data[key]}`;
  //           }
  //           viewMail.appendChild(info);
  //         }

  //         // Email body
  //         row = document.createElement('hr');
  //         body = document.createElement('div');
  //         body.id = 'body';
  //         body.innerHTML = data.body;
  //         document.querySelector('#emails-view').append(viewMail, row, body);

  //         // Archiving emails
  //         archive = document.createElement('button');
  //         archive.id = 'archive'
  //         archive.type = 'button';
  //         if (data.archived === false) {
  //           archive.classList.add('btn', 'btn-warning', 'btn-sm');
  //           archive.textContent = 'Archive';
  //         } else {
  //           archive.classList.add('btn', 'btn-danger', 'btn-sm');
  //           archive.textContent = 'Unarchive';
  //         }
  //         viewMail.appendChild(archive);
          
  //         document.querySelector('#archive').onclick = () => {
  //           archiveButton = document.querySelector('#archive');
  //           if (data.archived === false) {
  //             console.log('ARCHIVED')
  //             fetch(`emails/${element.id}`, {
  //               method: 'PUT',
  //               body: JSON.stringify({
  //                 archived: true
  //               })
  //             });
  //             archiveButton.classList.remove('btn-warning');
  //             archiveButton.classList.add('btn-danger');
  //             archiveButton.textContent = 'Unarchive';
  //           } else {
  //             console.log('UNARCHIVED')
  //             fetch(`emails/${element.id}`, {
  //               method: 'PUT',
  //               body: JSON.stringify({
  //                 archived: false
  //               })
  //             })
  //             archiveButton.classList.remove('btn-danger');
  //             archiveButton.classList.add('btn-warning');
  //             archiveButton.textContent = 'Archive';
  //           }
  //           load_mailbox('inbox');
  //         };
  //       })
  //     }
  //   });
  // });
}

function view_email(id) {
  // Removes inbox divs
  document.querySelectorAll('.mail-item, h3, #archive').forEach(e => e.remove());

  // Email will be read
  fetch(`emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    }),
  })
  
  fetch(`emails/${id}`)
  .then(response => response.json())
  .then(data => {
      // Archive button
      archive = document.createElement('button');
      archive.id = 'archive'
      archive.type = 'button';
      if (data.archived === false) {
        archive.classList.add('btn', 'btn-warning', 'btn-sm');
        archive.textContent = 'Archive';
      } else {
        archive.classList.add('btn', 'btn-danger', 'btn-sm');
        archive.textContent = 'Unarchive';
      }

      // Email information
      view = document.createElement('div');
      for (key in data) {
        if (key === 'id' || key === 'read' || key === 'archived' || key === 'body') {
          continue;
        }
        info = document.createElement('div');
        if (key === 'sender') {
          info.innerHTML = `<b>From:</b> ${data[key]}`;
        } else if (key === 'recipients') {
          info.innerHTML = `<b>To:</b> ${data[key]}`;
        } else if (key === 'subject'){
          info.innerHTML = `<b>Subject:</b> ${data[key]}`;
        } else {
          info.innerHTML = `<b>Timestamp:</b> ${data[key]}`;
        }
        view.appendChild(info);
      }
      row = document.createElement('hr');
      body = document.createElement('div');
      body.id = 'body';
      body.innerHTML = data.body;
      document.querySelector('#emails-view').append(archive, view, row, body);

      document.querySelector('#archive').onclick = () => {
        archive_mail(data.id);
      };
  });
}

function archive_mail(id) {
  fetch(`emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false,
    })
  })
  .then(response => response.text())
  .then(data => {
    load_mailbox('inbox');
  });

}