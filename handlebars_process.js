// args:
//   - handlebars template file
//   - json data file

var handlebars = require('handlebars');
var fs = require('fs');
var helpers = require('handlebars-helpers');
// helpers.object();
// helpers.array();
// helpers.comparison();

var template_file = process.argv[2];
var data_file = process.argv[3];



// {{cap value}}
handlebars.registerHelper('cap', function(text) {
    var words = text.split(' ');
    for (var i = 0; i < words.length; i++) {
	if (words[i].length > 1) {
	    words[i] = words[i][0].toUpperCase() + words[i].substr(1);
	}
    }
    return words.join(' ');
})

// {{uncap value}}
handlebars.registerHelper('uncap', function(text) {
    var words = text.split(' ');
    for (var i = 0; i < words.length; i++) {
	if (words[i].length > 1) {
	    words[i] = words[i][0].toLowerCase() + words[i].substr(1);
	}
    }
    return words.join(' ');
})

// {{downcase value}}
handlebars.registerHelper('downcase', function(text) {
    return text.toLowerCase();
})

// {{indent "  " value}}
handlebars.registerHelper('indent', function(indent, text) {
    var lines = text.split('\n');
    var result = []
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].length != 0)
            result.push(indent + lines[i]);
    }
    return result.join('\n');
})

// {{indentProp "  " "a.b"}}
handlebars.registerHelper('indentProp', function(indent, options) {
    var text = helpers.utils.get(this, options.hash.prop);
    var lines = text.split('\n');
    var result = []
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].length != 0)
            result.push(indent + lines[i]);
    }
    return result.join('\n');
})

// {{#each list}}
// {{list_value}}{{commaDelim}}
// {{/each}}
handlebars.registerHelper('commaDelim', function(context) {
    return context.data.last ? "" : ",";
})

// {{#each list}}
// {{list_value}}{{curryArrowDelim}}
// {{/each}}
handlebars.registerHelper('curryArrowSpaceDelim', function(context) {
    return context.data.last ? "" : " -> ";
})

// {{#each list}}
// {{list_value}}{{commaSpaceDelim}}
// {{/each}}
handlebars.registerHelper('commaSpaceDelim', function(context) {
    return context.data.last ? "" : ", ";
})

// {{#each list}}
// {{list_value}}{{applFmapDelimSuffix}}
// {{/each}}
handlebars.registerHelper('applFmapDelimSuffix', function(context) {
    return context.data.last ? "" : " <*>";
})

// {{#each list}}
// {{list_value}}{{applFmapDelimPrefix}}
// {{/each}}
handlebars.registerHelper('applFmapDelimPrefix', function(context) {
    return context.data.first ? "<$> " : "<*> ";
})

// {{#equal unicorns ponies }}
// That's amazing, unicorns are actually undercover ponies
// {{/equal}}
handlebars.registerHelper('equal', function(lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if(lvalue != rvalue) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
});

// {{#compare unicorns ponies operator="<"}}
// I knew it, unicorns are just low-quality ponies!
// {{/compare}}
handlebars.registerHelper('compare', function(lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
    var operator = options.hash.operator || "==";
    var operators = {
        '==':       function(l,r) { return l == r; },
        '===':      function(l,r) { return l === r; },
        '!=':       function(l,r) { return l != r; },
        '<':        function(l,r) { return l < r; },
        '>':        function(l,r) { return l > r; },
        '<=':       function(l,r) { return l <= r; },
        '>=':       function(l,r) { return l >= r; },
        'typeof':   function(l,r) { return typeof l == r; }
    }
    if (!operators[operator])
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);
    var result = operators[operator](lvalue,rvalue);
    if( result ) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

// {{#ifValueEquals type equals="image"}}
//   {{title}}
// {{/ifValueEquals}}
handlebars.registerHelper("ifValueEquals", function(conditional, options) {
    if (conditional == options.hash.equals) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

// {{valueProp "a.b"}}
handlebars.registerHelper("valueProp", function(prop) {
    var value = helpers.utils.get(this, prop);
    return value;
});

// {{#ifPropEquals prop="a.b" equals="image"}}
//   {{title}}
// {{/ifPropEquals}}
handlebars.registerHelper("ifPropEquals", function(options) {
    var conditional = helpers.utils.get(this, options.hash.prop);
    // console.log(options.hash.prop + "  " + conditional + "  " + options.hash.equals)
    if (conditional == options.hash.equals) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

// {{#ifProp "a.b"}}
//   {{title}}
// {{/ifProp}}
handlebars.registerHelper("ifProp", function(options) {
    var conditional = helpers.utils.get(this, options.hash.prop);
    if (conditional) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

// {{#ifPropNameIsForeignKey propName}}
//   ...
// {{/ifPropNameIsForeignKey}}
handlebars.registerHelper("ifPropNameIsForeignKey", function(propName, options) {
    if (propName.endsWith("Id")) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

// {{#ifPropIsForeignKey propObj}}
//   ...
// {{/ifPropIsForeignKey}}
// handlebars.registerHelper("ifPropIsForeignKey", function(propObj, options) {
//     if (propObj["propName"].endsWith("Id")) {
//         return options.fn(this);
//     } else {
//         return options.inverse(this);
//     }
// });

handlebars.registerHelper("truncateTwoCharsAtEnd", function(str, options) {
    return str.substring(0, str.length-2);
});


// {{shakespVariable}}{{name}}{{shakespVariable}}
handlebars.registerHelper('shakespVariable', function(options) {
    return new handlebars.SafeString('#{' + options.fn(this) + '}');
});

// {{shakespRoute}}{{name}}{{shakespRoute}}
handlebars.registerHelper('shakespRoute', function(options) {
    return new handlebars.SafeString('@{' + options.fn(this) + '}');
});

handlebars.registerHelper('eachForeignKeyProp', function(array, options) {
    var tmpArr = []
    for (var j = 0; j < array.length; j++) {
        var o = array[j];
        if (o["propType"].endsWith("Id"))
            tmpArr.push(o)
    }
    var aLen = tmpArr.length;
    var i = -1;
    var buffer = '';
    while (++i < aLen) {
        var item = tmpArr[i];
        item.index = i + 1;
        item.total = aLen;
        item.isFirst = i === 0;
        item.isLast = i === (aLen - 1);
        data.index = i;
        data.total = item.total;
        data.first = item.isFirst;
        data.last = item.isLast;
        buffer += options.fn(item, {data: data});
    }
    return buffer;
});

handlebars.registerHelper('filterByPropValues', function(selectPropName, values, array, options) {
    var vLen = values.length;
    var buffer = '';
    var i = -1;
    var m = {};
    for (var j = 0; j < array.length; j++) {
        var o = array[j];
        m[o[selectPropName]] = o;
    }
    while (++i < vLen) {
        var item = m[values[i]];
        item.index = i + 1;
        item.total = vLen;
        item.isFirst = i === 0;
        item.isLast = i === (vLen - 1);
        data.index = i;
        data.total = item.total;
        data.first = item.isFirst;
        data.last = item.isLast;
        buffer += options.fn(item, {data: data});
    }
    return buffer;
});

handlebars.registerHelper('filterByPropValuesIfTrue', function(selectPropName, values, array, checkIfPropName, options) {
    var vLen = values.length;
    var buffer = '';
    var i = -1;
    var m = {};
    for (var j = 0; j < array.length; j++) {
        var o = array[j];
        m[o[selectPropName]] = o;
    }
    var array2 = []
    while (++i < vLen) {
        var item = m[values[i]];
        if (item[checkIfPropName])
            array2.push(item)
    }
    i = -1;
    vLen = array2.length
    while (++i < vLen) {
        var item = array2[i];
        item.index = i + 1;
        item.total = vLen;
        item.isFirst = i === 0;
        item.isLast = i === (vLen - 1);
        data.index = i;
        data.total = item.total;
        data.first = item.isFirst;
        data.last = item.isLast;
        buffer += options.fn(item, {data: data});
    }
    return buffer;
});







var partialsDir = 'templates';
var filenames = fs.readdirSync(partialsDir);
filenames.forEach(function (filename) {
    var matches = /^_([^.]+).hbs$/.exec(filename);
    if (!matches) {
        return;
    }
    var name = matches[1];
    var template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');
    handlebars.registerPartial(name, template);
});

var template_source = fs.readFileSync(template_file, 'utf-8')
var data = JSON.parse(fs.readFileSync(data_file, 'utf-8').toString());

var template = handlebars.compile(template_source);
var html = template(data);
console.log(html)
