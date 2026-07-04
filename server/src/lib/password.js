import bcrypt from 'bcrypt';

const COST =12;

async function hash(plain){
    return bcrypt.hash(plain, COST);
}

async function compare(plain, hashed){
    return bcrypt.compare(plain, hashed);
}

export { hash, compare };