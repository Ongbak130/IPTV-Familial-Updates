import {parseInvitationFragment, makeAppLink} from './invite.mjs';

const invite = parseInvitationFragment(window.location.hash);
const status = document.getElementById('state');
if (!invite) {
  status.textContent = 'Invitation invalide ou incomplète.';
  document.getElementById('invalid').classList.remove('hidden');
} else {
  const appLink = makeAppLink(invite);
  const shareLink = window.location.href;
  const link = document.getElementById('open');
  link.href = appLink;
  link.addEventListener('click', () => {
    status.textContent = 'Ouverture de l’application… Si rien ne se passe, utilise « Copier l’invitation ».';
  });
  const field = document.getElementById('invitation');
  field.value = shareLink;
  document.getElementById('copy').addEventListener('click', async () => {
    let copied = false;
    try {
      await navigator.clipboard.writeText(shareLink);
      copied = true;
    } catch (_) {
      field.focus();
      field.select();
      copied = document.execCommand('copy');
    }
    status.textContent = copied ?
      'Lien copié. Ouvre IPTV Familial et colle-le dans Domicile intelligent.' :
      'Sélectionne le lien ci-dessous et copie-le manuellement.';
  });
  status.textContent = 'Tu as reçu une invitation privée. Ouvre l’application pour rejoindre le Hub.';
  document.getElementById('valid').classList.remove('hidden');
}
