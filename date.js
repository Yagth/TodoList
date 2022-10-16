
exports.getDate = function(){
    const today = new Date();
    const options = {
        weekday : "long",
        month : "long",
        day : "numeric"
    }
    return today.toLocaleDateString("en-US",options);
}

exports.getDay = function(){
    const day = new Date();
    const options = {
        weekday : "long"
    }
    return day.toLocaleDateString("en-US",options);
}
