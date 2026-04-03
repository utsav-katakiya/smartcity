const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
};

const pagesDir = path.join(__dirname, 'src', 'pages');
['user', 'admin', 'department'].forEach(sub => {
  const d = path.join(pagesDir, sub);
  if (!fs.existsSync(d)) return;
  const files = walk(d);
  files.forEach(f => {
    let txt = fs.readFileSync(f, 'utf8');
    txt = txt.split('../components/').join('../../components/');
    txt = txt.split('../styles/').join('../../styles/');
    txt = txt.split('../assets/').join('../../assets/');
    fs.writeFileSync(f, txt, 'utf8');
  });
});
console.log('Fixed imports again.');
