const express = require('express');
const axios = require('axios');
const responseTime = require('response-time');
const redis = require('redis');

(async() => {

    const client = await redis.createClient({
        host: "127.0.0.1",
        port: 6379
    }).connect();
    
    
    // app
    const app = express();
    
    // middlewares
    app.use(responseTime());
    
    // API
    const url = "https://rickandmortyapi.com/api"
    
    app.get('/character', async (req, res) => {
    
        try{
            let characters = await client.get("characters");
            characters = !!characters?.length ? JSON.parse(characters) : null;
            if (!characters){
                const response = await axios.get(`${url}/character`);
                await client.set("characters", JSON.stringify(response.data));
                return res.json(response?.data);
            }
            return res.send(characters);
        }catch(err){
            res.status(error.response.status).json({ message: error.message });
        }
    
    });
    
    app.get("/character/:id", async (req, res) => {
        try {
            const { id } = req.params;

            const characterKeyId = `character:${id}`;
            const character = await client.get(characterKeyId);

            if(character){
                return res.json(JSON.parse(character));
            }
            const response = await axios.get(`${url}/character/${id}`);

            await client.set(characterKeyId, JSON.stringify(response.data));

            return res.json(response.data);
            
        } catch (error) {
            res.status(error.response.status).json({ message: error.message });
        }

    });
    app.listen(3000, () => {
        console.log('🚀 server is running on http://localhost:3000');
    });

})();