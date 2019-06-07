function myFunction() {
    fetchPage()
    // SoundexAlgo();
}

var finalResult = { result: [] };
var pr = { printableResult: [] };

function fetchPage() {
    var pages = ["./pages/page1.html", "./pages/page2.html"];
    //var pages = ["/soundex/pages/page1.html", "/soundex/pages/page2.html"];
    $.when($.each(pages,
        function (a, b) {
            WriteStatus("Processing File " + (a + 1) + "...");
            ProcessPages(a + 1, b)

        })).then(function () {
            WriteStatus("Getting data Ready")
            setTimeout(function () {
                WriteStatus("Getting printable result...");
                GetPrintableResult()
                //DistinctArray();
                console.log(pr)
                WriteStatus("Building up the table");
                var itemsProcessed = 0;
                var arrayLength = pr.printableResult.length;
                pr.printableResult.forEach(function (a) {
                    var word = GetSameWords(a.result);
                    console.log(word);
                    var secondTd = "";
                    word.forEach(function (w) {
                        var inDocs = w.documents.length === 1 ? "1" : "1,2";
                        secondTd += w.word + ": " + inDocs + ";<br>"
                    });
                    $(".tbody").append(GetTr(a.soundex, secondTd));
                    itemsProcessed++;
                    if (itemsProcessed === arrayLength) {
                        WriteStatus("Done!");

                        $(".status").slideUp(1000,
                            function () {
                                $(".table").fadeIn("slow")
                            })
                    }
                });


            }, 1000);
        });
}

function ProcessPages(fileNo, page) {
    $.get(page, "", function (data) {
        var regex = /((?:[a-zA-Z]{5,})+)/gm;
        var m;
        var count = 0;
        var words = [];
        while ((m = regex.exec(data)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            m.forEach((match, groupIndex) => {
                count++;
                words.push(match.toLowerCase());
                //
            });
        }
        words = Array.from(new Set(words))
        words.forEach(function (word) {
            SoundexAlgo(fileNo, word)
        });
        WriteStatus("File " + fileNo + " process finished. " + count + " words processed. " + words.length + " unique words");

    }, "html");

}

function SoundexAlgo(fileNo, s) {

    var isAlpha = function (s) { return /^[a-zA-Z]+$/.test(s) }

    var soundexvalue = function (s) {
        if (s === '')
            return '0000';

        var
            head = s[0].toLowerCase(),
            tail = s.substr(1).toLowerCase()

        if (!isAlpha(head))
            return soundexvalue(tail)

        var
            dict = {
                a: '', e: '', i: '', o: '', u: '', y: '', h: '', w: '',
                b: 1, f: 1, p: 1, v: 1,
                c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2,
                d: 3, t: 3,
                l: 4,
                m: 5, n: 5,
                r: 6
            },
            t = tail.split(''),
            r = head + t
                .map(function (v, i, array) { return dict[v] })
                .filter(function (v, i, array) { return i === 0 ? v !== dict[head] : v !== array[i - 1] })
                .join('')

        return (r.toUpperCase() + '000').slice(0, 4);
    }
    finalResult.result.push({ fileNo, s, soundex: soundexvalue(s) });
    //console.log(s + "'s soundex code is " + soundexvalue(s))
}

function WriteStatus(s) {

    var ht = $(".status").html();
    $(".status").html("");
    $(".status").html(s + "<br>" + ht);
}

function DistinctArray() {
    var array = finalResult.result;
    var flags = [], output = [], l = array.length, i;
    for (i = 0; i < l; i++) {
        if (flags[array[i].s]) continue;
        flags[array[i].s] = true;
        output.push(array[i]);
    }
    finalResult.result = output;
}

function GetPrintableResult() {
    var array = finalResult.result;
    var flags = [], output = [], l = array.length, i;
    for (i = 0; i < l; i++) {
        if (flags[array[i].soundex]) continue;
        flags[array[i].soundex] = true;
        var arrayTemp = array;
        var soundex = array[i].soundex;

        var b = arrayTemp.filter(obj =>
            obj.soundex === soundex

        )
        pr.printableResult.push({ soundex, result: b });

    }
}
function GetSameWords(array) {

    var flags = [], output = [], l = array.length, i;
    for (i = 0; i < l; i++) {

        if (flags[array[i].s] === true) {
            var word = array[i].s;
            var find = output.find(function (a) {
                return a.word === word;
            });
            find.documents.push(2)
            continue;

        }
        flags[array[i].s] = true;

        output.push({ word: array[i].s, documents: [1] });
    }
    return output;

}

function GetTr(soundex, text) {
    return "<tr><td>" + soundex + "</td><td>" + text + "</td></tr>";
}

function SearchIt() {

    var input, filter, tbody, tr, a, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    tbody = document.getElementById("Contents");
    tr = tbody.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = "";
        } else {
            tr[i].style.display = "none";
        }
    }
}
