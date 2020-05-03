function renderEmail(image, emailContent) {
  return `
  <html>
<head>
<style>
body{
  font-color:black;
}
.container {
  margin-left: 20px !important;
  margin-right: 20px !important;
  height: 100% !important;
  background-color: #f8f8f8;
  border-bottom-left-radius: 10px !important;
  border-bottom-right-radius: 10px !important;
}
.nav {
  border-top-left-radius: 10px !important;
  border-top-right-radius: 10px !important;
  background-color: #f4c23d;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 8px;
  text-align: left;
}
.p-0 {
  padding: 0 !important;
}
.m-0 {
  margin: 0 !important;
}
.email-content {
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 20px;
  font-size:14px !important;
}
span {
  display: inline !important;
  margin-right: 5px;
  font-style: normal;
  font-size: 12px;
  font-weight: 400;
  color: #b9b9b9;
}
pre {
  display: inline !important;
  font-weight: bolder !important;
  margin-right: 5px;
  font-style: normal;
  font-size: 12px;
  color: #b9b9b9;
}
h2,
h3,
h4 {
  margin-bottom: 0 !important;
  color:#f4c23d !important;
}
mark {
  background-color: #f7f7f7 !important;
  display: inline-block !important;
  padding: 15px 30px !important;
  margin: 0px 20px !important;
  font-size: 15px !important;
  color: #2959ad !important;
  font-family: "georgia", serif !important;
  line-height: 26px !important;
  border-left: 3px solid #f4c23d !important;
}
img{
  margin-left:20px !important;
  marign-right:20px !important;
  height:520px !important;
  border-radius:10px;
}
.image{
  margin-top:50px !important;
}
</style>

</head>

<body>
  <div class='container'>
  <div class='nav'>
      <h1 class='p-0 m-0'>
      Kar Arabia
      </h1>
      </div>
    <div class='image'>
    
    <img src=${image} alt=""/>
    </div>
    
    <div class='email-content'>
    ${emailContent}
      </div>
      </div>
      </body>
      </html>     `;
}

module.exports = renderEmail;
