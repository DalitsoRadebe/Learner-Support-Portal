const word = 'code wars'
function toAcronym() {
    let split = word.split(' ')
    console.log(split)
    let first = split.map(word=>word[0].toUpperCase()).join('')
    console.log(first)
   
}toAcronym()