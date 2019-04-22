const express = require('express')
const app = express()
const sqlite = require('sqlite')
const bodyParser = require('body-parser')
const path = require('path') 
const dbConnection = sqlite.open(path.resolve(__dirname, 'banco.sqlite'), { Promise })
const port = process.env.PORT || 3000

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname,'public')))
app.use(bodyParser.urlencoded({ extended: true }))
app.get('/', async(request, response) => {
    const db = await dbConnection
    const categoriasDb = await db.all('SELECT * FROM categorias;')    
    const vagas = await db.all('SELECT * FROM vagas')
    const categorias = categoriasDb.map(cat => {
        return {
            ...cat,
            vagas: vagas.filter( vaga => vaga.categoria === cat.id)
        }
    })
    response.render('home', {
        categorias
    })
})

app.get('/vaga/:id', async(request, response) => {
    const db = await dbConnection
    const vaga = await db.get('SELECT * FROM vagas WHERE id = '+request.params.id)
    response.render('vaga', {
        vaga
    })
})

app.get('/admin', (req, res) => {
    res.render('admin/home')
})

//EDITING, ADDING AND DELETE CATEGORIAS

app.get('/admin/categorias', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('SELECT * FROM categorias;')
    res.render('admin/categorias', { categorias })
})

app.get('/admin/categorias/delete/:id', async(req, res) => {
    const db = await dbConnection
    await db.run('DELETE FROM categorias WHERE id='+req.params.id+'')
    res.redirect('/admin/categorias')
})

app.get('/admin/categorias/nova', async(req, res) => {
    res.render('admin/nova-categoria')
})

app.post('/admin/categorias/nova', async(req, res) => {
    const { categoria } = req.body 
    const db = await dbConnection
    await db.run(`INSERT INTO categorias(categoria) VALUES('${categoria}')`)
    res.redirect('/admin/categorias')
})

app.get('/admin/categorias/editar/:id', async(req, res) => {
    const db = await dbConnection
    const categoria = await db.get('SELECT * FROM categorias WHERE id = '+req.params.id)
    res.render('admin/editar-categoria', { categoria })
})

app.post('/admin/categorias/editar/:id', async(req, res) => {
    const { categoria } = req.body 
    const { id }= req.params
    const db = await dbConnection
    await db.run(`UPDATE categorias SET categoria = '${categoria}' WHERE id = ${id}`)
    res.redirect('/admin/categorias')
})

//EDITING, ADDING AND DELETE VAGAS

app.get('/admin/vagas', async(req, res) => {
    const db = await dbConnection
    const vagas = await db.all('SELECT * FROM vagas;')
    res.render('admin/vagas', { vagas })
})

app.get('/admin/vagas/delete/:id', async(req, res) => {
    const db = await dbConnection
    await db.run('DELETE FROM vagas WHERE id='+req.params.id+'')
    res.redirect('/admin/vagas')
})

app.get('/admin/vagas/nova', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('SELECT * FROM categorias')
    res.render('admin/nova-vaga', { categorias })
})

app.post('/admin/vagas/nova', async(req, res) => {
    const { titulo, descricao, categoria } = req.body 
    const db = await dbConnection
    await db.run(`INSERT INTO vagas(categoria, titulo, descricao) VALUES(${categoria}, '${titulo}', '${descricao}')`)
    res.redirect('/admin/vagas')
})

app.get('/admin/vagas/editar/:id', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('SELECT * FROM categorias')
    const vaga = await db.get('SELECT * FROM vagas WHERE id = '+req.params.id)
    res.render('admin/editar-vaga', { categorias, vaga })
})

app.post('/admin/vagas/editar/:id', async(req, res) => {
    const { titulo, descricao, categoria } = req.body 
    const { id }= req.params
    const db = await dbConnection
    await db.run(`UPDATE vagas SET categoria = '${categoria}', titulo = '${titulo}', descricao = '${descricao}' WHERE id = ${id}`)
    res.redirect('/admin/vagas')
})

const init = async() => {
    const db = await dbConnection
    await db.run('CREATE TABLE IF NOT EXISTS categorias (id INTEGER PRIMARY KEY, categoria TEXT);')
    await db.run('CREATE TABLE IF NOT EXISTS vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);')
    //await db.run('drop table categorias;')
    //const categoria = 'Marketing team'
    //await db.run(`insert into categorias(categoria) values('${categoria}')`)
    //const vaga = 'Social Media (San Francisco)'
    //const descricao = 'Vaga para marketing digital em San Francisco'
    //await db.run(`insert into vagas(categoria, titulo, descricao) values(2, '${vaga}', '${descricao}')`)
    //await db.run(`update vagas set descricao = 'Vaga para marketing digital em San Francisco' where id=2`)
}
init()

app.listen(port, (err) => {
    if(err){
        console.log('Não foi possível iniciar o servidor do Jobify;')
    }else {
        console.log('Servidor do Jobify funcionando!')
    }
})
