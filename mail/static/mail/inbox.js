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

  document.querySelector('#compose-recipients').disabled = false;
  document.querySelector('#compose-subject').disalbed = false;

  // Send mail as POST
  document.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault();
    await fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value,
      }),
    })
    .then(response => response.json())
    .then(data => console.log(data));

    load_mailbox('sent');
  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`;

  // Load correct mails for respective mailboxes
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(data => {
    data.forEach(element => {
      mail = document.createElement('div');
      mail.classList.add('mail-item', 'row');
      mail.id = element.id;
      mail.innerHTML = `<div class="col">${element.sender}</div> <div class="col">${element.subject}</div> <div class="col" style="text-align:right;">${element.timestamp}</div>`
      document.querySelector('#emails-view').append(mail);

      // Read mail
      if (element.read === true) {
        mail.style.backgroundColor = 'rgba(220, 220, 220, 0.7)';
      }
    });

    // View the mail
    document.querySelectorAll('.mail-item').forEach(mail => {
      mail.addEventListener('click', () => {
        view_email(mail.id);
      })
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
  });
  
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(data => {
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

      // Archive button
      archive = document.createElement('button');
      archive.id = 'archive'
      archive.type = 'button';
      if (data.archived === false) {
        archive.classList.add('btn', 'btn-outline-warning', 'btn-sm');
        archive.textContent = 'Archive';
      } else {
        archive.classList.add('btn', 'btn-outline-danger', 'btn-sm');
        archive.textContent = 'Unarchive';
      }
      // Reply Button
      reply = document.createElement('button'); 
      reply.id = 'reply';
      reply.type = 'button';
      reply.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      reply.textContent = 'Reply';

      // Button div
      btns = document.createElement('div');
      btns.id = 'btns';
      btns.appendChild(archive);
      btns.appendChild(reply);

      // Horizontal line
      row = document.createElement('hr');

      // Email body
      body = document.createElement('div');
      body.id = 'body';
      body.innerHTML = data.body;

      document.querySelector('#emails-view').append(view, btns, row, body);

      // Archiving emails
      document.querySelector('#archive').addEventListener('click', () => {
        if (data.archived === false) {
          archive_mail(data.id);
        } else {
          unarchive_mail(data.id);
        }
      });

      // Reply to email
      document.querySelector('#reply').addEventListener('click', () => {
        reply_mail(data.id);
      });

  });
}

async function archive_mail(id) {
  await fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true,
    })
  })
  load_mailbox('archive');
}

async function unarchive_mail(id) {
  await fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false,
    })
  })
  load_mailbox('inbox');
}

function reply_mail(id) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('input[type="submit"]').value = 'Reply';

  // Disable recipients and subject fields
  document.querySelector('#compose-recipients').disabled = true;
  document.querySelector('#compose-subject').disabled = true;

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(data => {

    // Pre-populate fields
    document.querySelector('#compose-recipients').value = data.sender;
    if (data.subject.slice(0, 3) === 'Re:') {
      document.querySelector('#compose-subject').value = data.subject;
    } else {
      document.querySelector('#compose-subject').value = `Re: ${data.subject}`;
    }
    document.querySelector('#compose-body').value = `On ${data.timestamp} ${data.sender} wrote: ${data.body}\n`;
    stampedMessage = document.querySelector('#compose-body').value;

  });

  // Send the replied email
  document.querySelector('form').addEventListener('submit', async () => {
    await fetch(`/emails`, {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: `${document.querySelector('#compose-body').value.replace(stampedMessage, '')}`
      })
    })
    .then(response => response.json())
    .then(data => console.log(data));
    load_mailbox('sent');
  });
}