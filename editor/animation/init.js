//Dont change it
requirejs(['ext_editor_1', 'jquery_190', 'raphael_210'],
    function (ext, $, TableComponent) {

        var cur_slide = {};

        ext.set_start_game(function (this_e) {
        });

        ext.set_process_in(function (this_e, data) {
            cur_slide["in"] = data[0];
        });

        ext.set_process_out(function (this_e, data) {
            cur_slide["out"] = data[0];
        });

        ext.set_process_ext(function (this_e, data) {
            cur_slide.ext = data;
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_process_err(function (this_e, data) {
            cur_slide['error'] = data[0];
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_animate_success_slide(function (this_e, options) {
            var $h = $(this_e.setHtmlSlide('<div class="animation-success"><div></div></div>'));
            this_e.setAnimationHeight(115);
        });

        ext.set_animate_slide(function (this_e, data, options) {
            var $content = $(this_e.setHtmlSlide(ext.get_template('animation'))).find('.animation-content');
            if (!data) {
                console.log("data is undefined");
                return false;
            }

            //YOUR FUNCTION NAME
            var fname = 'puzzle88';

            var checkioInput = data.in || [0, 4, 3, 1, 0, 1, 4, 2, 3, 0, 2, 0];
            var checkioInputStr = fname + '(' + checkioInput.join(", ") + ')';

            var failError = function (dError) {
                $content.find('.call').html('Fail: ' + checkioInputStr);
                $content.find('.output').html(dError.replace(/\n/g, ","));

                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
                $content.find('.answer').remove();
                $content.find('.explanation').remove();
                this_e.setAnimationHeight($content.height() + 60);
            };

            if (data.error) {
                failError(data.error);
                return false;
            }

            if (data.ext && data.ext.inspector_fail) {
                failError(data.ext.inspector_result_addon);
                return false;
            }

            var rightResult = data.ext["answer"];
            var userResult = data.out;
            var result = data.ext["result"];
            var result_code = data.ext["result_addon"][0];
            var result_message = data.ext["result_addon"][1];


            //if you need additional info from tests (if exists)
            var explanation = data.ext["explanation"];

            $content.find('.output').html('&nbsp;Your result:&nbsp;' + JSON.stringify(userResult));

            if (!result) {
                $content.find('.call').html('Fail: ' + checkioInputStr);
                $content.find('.answer').html(result_message);
                $content.find('.answer').addClass('error');
                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
            }
            else {
                $content.find('.call').html('Pass: ' + checkioInputStr);
                $content.find('.answer').remove();
            }

            if (result_code >= 5) {
                var canvas = new PuzzleCanvas($content.find(".explanation")[0]);
                canvas.prepare(checkioInput);
                canvas.run(userResult);
            }


            this_e.setAnimationHeight($content.height() + 60);

        });

        //This is for Tryit (but not necessary)
//        var $tryit;
//        ext.set_console_process_ret(function (this_e, ret) {
//            $tryit.find(".checkio-result").html("Result<br>" + ret);
//        });
//
//        ext.set_generate_animation_panel(function (this_e) {
//            $tryit = $(this_e.setHtmlTryIt(ext.get_template('tryit'))).find('.tryit-content');
//            $tryit.find('.bn-check').click(function (e) {
//                e.preventDefault();
//                this_e.sendToConsoleCheckiO("something");
//            });
//        });


        function PuzzleCanvas(dom) {
            var colorOrange4 = "#F0801A";
            var colorOrange3 = "#FA8F00";
            var colorOrange2 = "#FAA600";
            var colorOrange1 = "#FABA00";

            var colorBlue4 = "#294270";
            var colorBlue3 = "#006CA9";
            var colorBlue2 = "#65A1CF";
            var colorBlue1 = "#8FC7ED";

            var colorGrey4 = "#737370";
            var colorGrey3 = "#9D9E9E";
            var colorGrey2 = "#C5C6C6";
            var colorGrey1 = "#EBEDED";

            var colorWhite = "#FFFFFF";

            var marble = 20;

            var outerRing = marble * 5;
            var innerRing = marble * 3;


            var pad = 10;
            var size = 360 + 2 * pad;

            var paper = Raphael(dom, size, size);

            var ringsCentres = [
                [size / 2, size / 2],
                [pad + outerRing, pad + outerRing],
                [size - pad - outerRing, pad + outerRing],
                [pad + outerRing, size - pad - outerRing],
                [size - pad - outerRing, size - pad - outerRing]
            ];

            var shift = "T0," + (outerRing + innerRing);

            var positionsAct = [
                "R-90," + ringsCentres[1][0] + "," + ringsCentres[1][1],
                "R90," + ringsCentres[2][0] + "," + ringsCentres[2][1],
                "R180," + ringsCentres[1][0] + "," + ringsCentres[1][1],
                "",
                "R180," + ringsCentres[2][0] + "," + ringsCentres[2][1],
                "R90," + ringsCentres[1][0] + "," + ringsCentres[1][1],
                "R-90," + ringsCentres[2][0] + "," + ringsCentres[2][1],
                shift + "R180," + ringsCentres[3][0] + "," + ringsCentres[3][1],
                shift,
                shift + "R180," + ringsCentres[4][0] + "," + ringsCentres[4][1],
                shift + "R90," + ringsCentres[3][0] + "," + ringsCentres[3][1],
                shift + "R-90," + ringsCentres[4][0] + "," + ringsCentres[4][1]
            ];

            var attrBord = {"stroke": colorBlue4, "stroke-width": 3};


            var marbleColors = [colorGrey3, colorBlue1, "#66CC66", "#FF6666", colorOrange1];

            var holes = paper.set();

            var rings = paper.set();

            this.prepare = function (state) {
                for (var i = 1; i < 5; i++) {
                    paper.circle(ringsCentres[i][0], ringsCentres[i][1], innerRing).attr(
                        {"stroke": colorBlue4, "stroke-width": 3});
                    rings.push(paper.circle(ringsCentres[i][0], ringsCentres[i][1], outerRing).attr(
                        {"stroke": colorBlue4, "stroke-width": 3}));
                }
                for (i = 1; i < 5; i++) {
                    paper.circle(ringsCentres[i][0], ringsCentres[i][1], innerRing + marble).attr(
                        {"stroke": colorGrey1, "stroke-width": marble * 2 - 3});
                }

                var dots = Raphael.pathIntersection(
                    Raphael.format("M{0},{1}A{2},{2},0,1,1,{0},{3}",
                        ringsCentres[1][0], pad, outerRing, pad + outerRing * 2),
                    Raphael.format("M{0},{1}A{2},{2},0,1,0,{0},{3}",
                        ringsCentres[2][0], pad, outerRing, pad + outerRing * 2));
                for (i = 0; i < positionsAct.length; i++) {
                    var hole = paper.set();
                    hole.push(paper.path([
                        ["M", dots[0].x, dots[0].y],
                        ["A", outerRing, outerRing, 0, 0, 1, dots[1].x, dots[1].y],
                        ["A", outerRing, outerRing, 0, 0, 1, dots[0].x, dots[0].y],
                        ["Z"]]).attr(attrBord));
                    hole.push(paper.circle(size / 2, pad + outerRing, marble).attr(
                        {"stroke": colorBlue4, "stroke-width": 2, "fill": marbleColors[state[i]]}));
                    hole.transform(positionsAct[i]);
                    holes.push(hole);
                }

            };

            this.run = function(actions) {
                var i = 0;
                var ringsPositions = {
                    1: [0, 3, 5, 2],
                    2: [1, 4, 6, 3],
                    3: [5, 8, 10, 7],
                    4: [6, 9, 11, 8]
                };


                function rotate() {

                    if (i >= actions.length) {
                        return false;
                    }
                    var act = Number(actions[i]);
                    i++;
                    var wheel = paper.set();
                    var temp = holes[ringsPositions[act][0]];
                    for (var k = 0; k < 4; k++) {
                        wheel.push(temp);
                        var new_temp = holes[ringsPositions[act][(k+1)%4]];
                        holes[ringsPositions[act][(k+1)%4]] = temp;
                        temp = new_temp;
                    }
                    setTimeout(function() {
                        rings[act-1].toFront();
                        wheel.animate({"transform": "...R90," + ringsCentres[act][0] + "," + ringsCentres[act][1]},
                            1000, callback=function(){
                                rings[act-1].toBack();
                                rotate();
                            })}, 100);

                }

                setTimeout(rotate, 500);
            }

        }

    }
);
