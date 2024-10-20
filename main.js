const birthDate = new Date('2001-10-29');
const today = new Date();
const age = today.getFullYear() - birthDate.getFullYear() - 
           (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);

document.getElementById('year').innerHTML = document.getElementById('year').innerHTML.replace('{year}',today.getFullYear());

document.getElementById('year').innerHTML = document.getElementById('year').innerHTML.replace('{footer}','Mike Miroslav Wharton');

document.getElementById('age').innerHTML = document.getElementById('age').innerHTML.replace('{age}', age);
