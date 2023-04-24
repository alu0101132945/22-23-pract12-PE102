import express from 'express';
import { MongoClient } from 'mongodb'
import { Funko } from './funko.js';
import { FunkoUserStorage } from './usuario.js';
import { ResponseType} from './tipos.js';

const app = express();
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);


app.get('/funkos',async (req,res) => {
    try{
        if(!req.query.id){
            if(!req.query.username){   
                const resp : ResponseType = {
                    success: false,
                    msg : 'No se ha enviado un usuario para obtener la lista' 
                } 
                res.json(resp);
            } else{
                const user = req.query.username as string;
                await client.connect();
                const db = client.db(user);
                const collection = db.collection('funkos');
                const find = await collection.find().toArray;
                await client.close();
                res.json(find);
            }
        }else {
            if(!req.query.username){  
                const resp : ResponseType = {
                    success: false,
                    msg : 'No se ha enviado un usuario para obtener la lista' 
                }   
                res.send(resp);
            } else{
                const user = req.query.username as string;
                const id = Number(req.query.id as string);
                await client.connect();
                const db = client.db(user);
                const collection = db.collection('funkos');
                const find = await collection.findOne({id: id});
                await client.close();
                res.json(find);
            }
        }
    }catch(error){
        const resp:ResponseType = {
            success:false,
            msg: `Ha ocurrido un error al insertar un funko en la base de datos ${error}`
        }
        res.json(resp);
    }
})

app.post('/funkos', async (req,res) => {
    try{
        if(!req.query.username){
            const resp : ResponseType = {
                success: false,
                msg : 'No se ha enviado un usuario para obtener la lista' 
            }
            res.json(resp);
        } else{
            if(!req.query.id || !req.query.name || !req.query.desc || !req.query.tipo || !req.query.gen || !req.query.franq || !req.query.num || !req.query.excl || !req.query.esp || !req.query.val){
                const resp : ResponseType = {
                    success: false,
                    msg : 'No se ha enviado un funko valido para incluirlo en la lista' 
                }
                res.json(resp)
            }
            else{
                const user = req.query.username as string;
                await client.connect();
                const db = client.db(user);
                const collection = db.collection('funkos');
                const exclusivo = req.query.excl === "true";   
                const fun = new Funko(Number(req.query.id as string), req.query.name as string, req.query.desc as string, req.query.tipo as string, req.query.gen as string, req.query.franq as string, Number(req.query.num as string), exclusivo, req.query.esp as string, Number(req.query.val as string));
                const insert = await collection.insertOne(fun);
                const resp :ResponseType = {
                    success:true,
                    msg: `El funko se ha insertado correctamente ${insert}`
                }
                res.json(resp);
            }
        }
    }catch(error){
        const resp:ResponseType = {
            success:false,
            msg: `Ha ocurrido un error al insertar un funko en la base de datos ${error}`
        }
        res.json(resp);
    } finally{
        await client.close();
    }
});

app.patch('/funkos',(req, res) => {
    if(!req.query.username){
        const resp : ResponseType = {
            success: false,
            msg : 'No se ha enviado un usuario para obtener la lista' 
        }
        res.json(resp);
    } else{
        if(!req.query.id || !req.query.name || !req.query.desc || !req.query.tipo || !req.query.gen || !req.query.franq || !req.query.num || !req.query.excl || !req.query.esp || !req.query.val){
            const resp : ResponseType = {
                success: false,
                msg : 'No se ha enviado un funko valido para actualizarlo en la lista' 
            }
            res.json(resp)
        }
        else{
            const user = new FunkoUserStorage(req.query.username as string);
            const exclusivo = req.query.excl === "true";   
            const fun = new Funko(Number(req.query.id as string), req.query.name as string, req.query.desc as string, req.query.tipo as string, req.query.gen as string, req.query.franq as string, Number(req.query.num as string), exclusivo, req.query.esp as string, Number(req.query.val as string));
            const result = user.updateFunko(fun);
            res.json(result);
        }
    }
})

app.delete('/funkos', (req, res) => {
    if(!req.query.username){
        const resp : ResponseType = {
            success: false,
            msg : 'No se ha enviado un usuario para obtener la lista' 
        }
        res.json(resp);
    } else{
        if(!req.query.id){
            const resp : ResponseType = {
                success: false,
                msg : 'No se ha enviado un id valido para borrar un funko de la lista' 
            }
            res.json(resp)
        }
        else{
            const user = new FunkoUserStorage(req.query.username as string)
            const result = user.removeFunko(Number(req.query.id as string))
            res.json(result);
        }
    }
})

app.get('*',(_,res) =>{
    res.send({
        error : 404
        })
})

app.listen(3000, () => {
    console.log('Server is up on port 3000');
});
