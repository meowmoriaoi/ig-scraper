const instagram = require('./instagram');

(async () => {
    const username = '';
    const password = '';
    const url = '';

    await instagram.initialize(username, password, url);

    const data = await instagram.scrapeComments();

    for (let [index, commentElement] of data.entries()) {
        data[index] = await instagram.scrapeReplies(commentElement);
    }

    for (let x = 0; x < data.length; x++) {

        for (let [index, replyElement] of data[x]['replies'].entries()) {
            data[x]['replies'][index] = await instagram.processData(replyElement);
        }

    }

    let totalReplies = data.length;

    for (let i = 0; i < data.length; i++) {
        totalReplies += data[i]['replies'].length
    }

    console.log(totalReplies);


    debugger;

})();