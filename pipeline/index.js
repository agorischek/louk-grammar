const merge = require('merge');

module.exports = {
    readme: buildReadme,
    package: buildPackage
}

function buildPackage(packages, editor){

    const general = packages.general
    const specific = packages[editor]

    const packageInfo = merge(general, specific)

    return packageInfo
}

function buildReadme(content, editor){

    const input = content
    const lines = input.split("\n")

    const general = "*"

    var sections = []

    var section = []
    var appliesTo = []

    for(i = 0; i < lines.length; i++){

        const sectionPattern = /^@@@(.*)@@@$/
        if (lines[i].match(sectionPattern)){
            sections.push([appliesTo,section])
            var section = []
            var headerMatches = lines[i].match(sectionPattern)[1].split(" ")
            var appliesTo = []
            for(j = 0; j < headerMatches.length; j++){
                if(headerMatches[j] != ""){
                    appliesTo.push(headerMatches[j])
                }
            }
        }
        else{
            section.push(lines[i])
        }
    }

    sections.push([appliesTo,section])

    var scopedSections = []

    for(i = 0; i < sections.length; i++){
        if(sections[i][0].indexOf(editor) > -1 | sections[i][0].indexOf(general) > -1){
            scopedSections.push(sections[i][1])
        }
    }

    var output = ""

    for(i = 0; i < scopedSections.length; i++){
        for(j = 0; j < scopedSections[i].length; j++){
            output = output + scopedSections[i][j]
            if(i != (scopedSections.length - 1) && j != (scopedSections.length[i] - 1)){
                output = output + "\n"
            }
        }
    }

    return output
}
