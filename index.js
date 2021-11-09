const http = require('http');
const compression = require('compression');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const util = require('util')
const child_process = require('child_process')

app.use("/", express.static(__dirname + '/'));
// app.get('/', (req, res) => { res.redirect("/meta.html"); });


app.use(compression())

// local開発環境でのポート番号
let port = process.env.PORT || 8080
let server = http.createServer(app)
server.listen(port, () => console.log(`API listening on ${port}`))


app.use(bodyParser.json())
app.get('/', (req, res) => res.status(404).json({
    status: 404,
    message: 'Check the README.md for the accepted endpoints'
}))

const execFile = util.promisify(child_process.execFile);
const EXE_FILE = './sample_diffelev';


// ========================FUNCTIONS====================================

// -------------------------Thin----------------------------------------
async function thin(filepath, design, mode) {
    execFile(EXE_FILE, ['-p', filepath, '-x', design, '-g', mode])
        .then(() => {
            console.log('Successfully Thinned.');
        })
        .catch((err) => {
            console.log('Error!');
            console.log(err);
        });
}
// -------------------------Diffelev----------------------------------------
async function diffelev(filepath, design, mode, diffelev_data, heatmap_data) {
    execFile(EXE_FILE, ['-p', filepath, '-x', design, '-g', mode, '-d', diffelev_data, heatmap_data])
        .then(() => {
            console.log('Successfully determined Diffelev & Heatmap data.');
        })
        .catch((err) => {
            console.log('Error!');
            console.log(err);
        });
}
// -------------------------Slope----------------------------------------
async function slope(filepath, design, mode, angle_file) {
    execFile(EXE_FILE, ['-p', filepath, '-x', design, '-g', mode, '-a', angle_file])
        .then(() => {
            console.log('Successfully determined slope angles.');
        })
        .catch((err) => {
            console.log('Error!');
            console.log(err);
        });
}


// ================================API==================================
// ----------------------------1. Read Path (Must w/o Return)----------------------------
app.post('/filepath', async(req, res) => {
    // 入力値をセット
    const { filepath } = req.body
    const { design } = req.body

    filepath_global = filepath
    design_global = design

    try {
        
        // runChildProc(filepath, design);

        const returns = { 'Path': 'Path loaded'}
        console.log(`${filepath} loaded successfully \n${design} loaded successfully`)

        res.status(200).send(returns)
    } catch (error) {
        res.status(401).json({
            status: 401,
            message: error.message
        })
    }
});

// -----------------------------2. Thin (Optional with Return) -----------------------------------
app.post('/thin', async(req, res) => {
    // 入力値をセット
    const { mode } = req.body
    const { if_execute } = req.body
    mode_global = mode
    const returns = { 'mode': mode_global}

    if (if_execute == 1){
        try {
        // console.log("Loading " + filepath_global)
        // console.log("Loading " + design_global)
        //Execute thinning
         thin(filepath_global, design_global, mode);

        console.log(`thinning mode ${mode_global} is selected`);
        console.log("waiting for the thinning process to be completed...");
        
        // const returns = { 'mode': mode_global}

        res.status(200).send(returns)
    } catch (error) {
        res.status(401).json({
            status: 401,
            message: error.message
        })
    }
    } else{
        res.status(200).send(returns)
        console.log(`thinning mode ${mode_global} is selected`);

    }

});

// -----------------------------3. Diffelev (Must with Return)-----------------------------------
app.post('/diffelev', async(req, res) => {
    // 入力値をセット
     const { diffelev_data } = req.body
     const { heatmap_data } = req.body


    try {
        console.log("Loading " + filepath_global)
        console.log("Loading " + design_global)
        console.log("Loading " + mode_global + " mode")

        console.log("Creating " + diffelev_data)
        console.log("Creating " + heatmap_data)
        console.log("waiting for the diffelev process to be completed...");

        diffelev(filepath_global, design_global, mode_global, diffelev_data, heatmap_data)
    
        const returns = { 'siteOwner': 'hogehoge'}

        res.status(200).send(returns)
    } catch (error) {
        res.status(401).json({
            status: 401,
            message: error.message
        })
    }

});



// -----------------------------4. Slope (Optional with Return) -----------------------------------
app.post('/slope', async(req, res) => {
    // 入力値をセット
     const { angle_file } = req.body

    try {
        console.log("Loading " + filepath_global)
        console.log("Loading " + design_global)
        console.log("Loading " + mode_global + " mode")

        console.log("Creating " + angle_file)
        console.log("waiting for the calculating slope angles...");

        slope(filepath_global, design_global, mode_global, angle_file)
    
        const returns = { 'siteOwner': 'slope_angle'}

        res.status(200).send(returns)
    } catch (error) {
        res.status(401).json({
            status: 401,
            message: error.message
        })
    }

});



