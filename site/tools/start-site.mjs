import { networkInterfaces } from 'node:os';
import { spawn } from 'node:child_process';

const PORT = 8080;

function getLanIp() {
  const nets = networkInterfaces();
  for (const [name, addrs] of Object.entries(nets)) {
    if (!addrs || /clash|vpn|wsl|virtual|vmware|vmnet|loopback/i.test(name)) continue;
    for (const addr of addrs) {
      if (
        addr.family === 'IPv4' &&
        !addr.internal &&
        !addr.address.startsWith('198.18.') &&
        !addr.address.startsWith('169.254.')
      ) {
        return addr.address;
      }
    }
  }
  return null;
}

const lanIp = getLanIp();
console.log('\n--- Frontend Notes: Live Server ---');
console.log(`Компьютер:       http://127.0.0.1:${PORT}/site/`);
if (lanIp) {
  console.log(`Планшет (Wi-Fi): http://${lanIp}:${PORT}/site/`);
} else {
  console.log('Планшет (Wi-Fi): LAN IP не найден (проверь подключение к сети)');
}
console.log('---------------------------------\n');

const child = spawn(
  'live-server',
  [`--host=0.0.0.0`, `--port=${PORT}`, '--open=/site/', '--wait=300'],
  { stdio: 'inherit', shell: true }
);

child.on('exit', (code) => process.exit(code ?? 0));
