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

  // Send mail as POST
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
      console.log(result);
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

}

function view_email(id) {
  // Removes inbox divs
  document.querySelectorAll('.mail-item, h3').forEach(e => e.remove());

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
      // Reply Button
      reply = document.createElement('button'); 
      reply.id = 'reply';
      reply.type = 'button';
      reply.classList.add('btn', 'btn-primary', 'btn-sm');
      reply.textContent = 'Reply';

      // Horizontal line
      row = document.createElement('hr');

      // Email body
      body = document.createElement('div');
      body.id = 'body';
      body.innerHTML = data.body;


      document.querySelector('#emails-view').append(archive, view, reply, row, body);

      document.querySelector('#archive').onclick = () => {
        if (data.archived === false) {
          archive_mail(data.id);
        } else {
          unarchive_mail(data.id);
        }
      };

      document.querySelector('#reply').onclick = () => {
        reply_mail(data.id);
      };

  });
}

function archive_mail(id) {
  fetch(`emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
  .then(load_mailbox('inbox'));
}

function unarchive_mail(id) {
  fetch(`emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  })
  .then(load_mailbox('inbox'));
}

function reply_mail(id) {
  compose_email();

}