// load module
const express = require("express")
// use module
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));


const review = [
    {"answeredDate":"","appVersion":"1.2.9","createdDate":"20221020105603","responseBody":"","osVersion":"31","nickName":"여름이좋아","rating":"2","body":"\t처음 사용해보려고 들어갔는데 네트워크 오류 이 앱은 안되는건가요?","device":"Galaxy Note20 Ultra 5"},
    {"answeredDate":"","appVersion":"","createdDate":"20221020081044","responseBody":"","osVersion":"31","nickName":"손션","rating":"1","body":"\t깔았다가 지움","device":"Galaxy S2"},
    {"answeredDate":"","appVersion":"1.2.9","createdDate":"20221020025029","responseBody":"","osVersion":"32","nickName":"김진주","rating":"5","body":"\t힘내세요","device":"Galaxy Z Flip3 5"}
];


/**
 * @Path http://localhost:3000 basic port 3000
 */
app.get("/", (req, res) =>{
    res.send("Hello World!");
});

app.get("/get/review", (req, res) => {
    res.json({ok: true, reviews: review});
})

app.get("/get/review/nickname", (req, res) => {
    var name = req.query.nickName;
    let findedReview = review.filter(data => data.nickName === name);

    if (findedReview.length!=0)
        res.json({find: true, review: findedReview});
    else
        res.json({find: false});
})


app.listen(3000, () => console.log("nodejs study by mj..."));