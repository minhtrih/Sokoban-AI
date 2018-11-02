var WALL = 0,
    performance = window.performance;

$(function() {

    var $grid = $("#search_grid"),
        $selectWallFrequency = $("#selectWallFrequency"),
        $selectGridSize = $("#selectGridSize"),
        $checkDebug = $("#checkDebug"),
        $checkClosest = $("#checkClosest");

    var opts = {
        wallFrequency: $selectWallFrequency.val(),
        gridSize: $selectGridSize.val(),
        debug: $checkDebug.is("checked"),
        closest: $checkClosest.is("checked")
    };

    var grid = new GraphSearch($grid, opts, astar.search);

    //tạo map mới
    $("#btnGenerate").click(function() {
        grid.initialize();
    });

    //thay đổi số lượng vật cản
    $selectWallFrequency.change(function() {
        grid.setOption({wallFrequency: $(this).val()});
        grid.initialize();
    });

    //thay đổi kích thước map
    $selectGridSize.change(function() {
        grid.setOption({gridSize: $(this).val()});
        grid.initialize();
    });

    //hiện thông tin h(n) - g(n)
    $checkDebug.change(function() {
        grid.setOption({debug: $(this).is(":checked")});
    });

    //tìm đường đến gần nhất nếu không thể đến điểm đó
    $checkClosest.change(function() {
        grid.setOption({closest: $(this).is(":checked")});
    });

});

var css = { start: "start", finish: "finish", wall: "wall", active: "active" };


function GraphSearch($graph, options, implementation) {
    this.$graph = $graph;
    this.search = implementation; //tìm kiếm bằng astar
    this.opts = $.extend({wallFrequency:0.1, debug:true, gridSize:10}, options);
    this.initialize();
}

//lựa chọn
GraphSearch.prototype.setOption = function(opt) {
    this.opts = $.extend(this.opts, opt);
    this.drawDebugInfo();
};

//khởi tạo map
GraphSearch.prototype.initialize = function() {
    this.grid = [];
    var self = this,
        nodes = [],
        $graph = this.$graph;

    $graph.empty();

    //kích thước map
    var cellWidth = ($graph.width()/this.opts.gridSize)-2,  // -2 for border
        cellHeight = ($graph.height()/this.opts.gridSize)-2,
        $cellTemplate = $("<span />").addClass("grid_item").width(cellWidth).height(cellHeight),
        startSet = false;

    for(var x = 0; x < this.opts.gridSize; x++) {
        var $row = $("<div class='clear' />"), // add class="clear"
            nodeRow = [],
            gridRow = [];

        for(var y = 0; y < this.opts.gridSize; y++) {
            var id = "cell_"+x+"_"+y,
                $cell = $cellTemplate.clone();
            $cell.attr("id", id).attr("x", x).attr("y", y);
            $row.append($cell);
            gridRow.push($cell);

            //mật độ vật cản
            var isWall = Math.floor(Math.random()*(1/self.opts.wallFrequency));
            if(isWall === 0) {
                nodeRow.push(WALL);
                $cell.addClass(css.wall);
            }
            else  {
                var cell_weight = ($("#generateWeights").prop("checked") ? (Math.floor(Math.random() * 3)) * 2 + 1 : 1);
                nodeRow.push(cell_weight);
                $cell.addClass('weight' + cell_weight);
                if ($("#displayWeights").prop("checked")) {
                    $cell.html(cell_weight);
                }
                if (!startSet) {
                    $cell.addClass(css.start);
                    startSet = true;
                }
            }
        }
        $graph.append($row);

        this.grid.push(gridRow);
        nodes.push(nodeRow);
    }

    this.graph = new Graph(nodes);

    // bind cell event, set start/wall positions
    this.$cells = $graph.find(".grid_item");
    this.$cells.click(function() {
        self.cellClicked($(this));
    });
};

//di chuyển đến vị trí lựa chọn
GraphSearch.prototype.cellClicked = function($end) {

    var end = this.nodeFromElement($end);

    if($end.hasClass(css.wall) || $end.hasClass(css.start)) {
        return;
    }

    this.$cells.removeClass(css.finish);
    $end.addClass("finish");
    var $start = this.$cells.filter("." + css.start),
        start = this.nodeFromElement($start);

    var sTime = performance ? performance.now() : new Date().getTime();

    //đường đi gần tới điểm
    var path = this.search(this.graph, start, end, {
        closest: this.opts.closest
    });

    //tính toán thời gian
    var fTime = performance ? performance.now() : new Date().getTime(),
        duration = (fTime-sTime).toFixed(2);

    //với trường hợp không đi đến được điểm yêu cầu
    if(path.length === 0) {
        $("#message").text("couldn't find a path (" + duration + "ms)");
        this.animateNoPath();
    }
    else {
        $("#message").text("search took " + duration + "ms.");
        this.drawDebugInfo();
        this.animatePath(path);
    }
};

//hiện thông tin h(n) - g(n)
GraphSearch.prototype.drawDebugInfo = function() {
    this.$cells.html(" ");
    var that = this;
    if(this.opts.debug) {
        that.$cells.each(function() {
            var node = that.nodeFromElement($(this)),
                debug = false;
            if (node.visited) {
                debug = "F: " + node.f + "<br />G: " + node.g + "<br />H: " + node.h;
            }

            if (debug) {
                $(this).html(debug);
            }
        });
    }
};

// set tọa độ phần tử
GraphSearch.prototype.nodeFromElement = function($cell) {
    return this.graph.grid[parseInt($cell.attr("x"))][parseInt($cell.attr("y"))];
};

//nếu không có đường đi
GraphSearch.prototype.animateNoPath = function() {
    var $graph = this.$graph;
    var jiggle = function(lim, i) {
        if(i>=lim) { $graph.css("top", 0).css("left", 0); return; }
        if(!i) i=0;
        i++;
        $graph.css("top", Math.random()*6).css("left", Math.random()*6);
        setTimeout(function() {
            jiggle(lim, i);
        }, 5);
    };
    jiggle(15);
};

//obj chuyển động
GraphSearch.prototype.animatePath = function(path) {
    var grid = this.grid,
        timeout = 1000 / grid.length,
        elementFromNode = function(node) {
        return grid[node.x][node.y];
    };

    var self = this;
    // will add start class if final
    var removeClass = function(path, i) {
        if(i >= path.length) { // Xóa đường dẫn xong, set vị trí cuối cùng là start
            return setStartClass(path, i);
        }
        elementFromNode(path[i]).removeClass(css.active);
        setTimeout(function() {
            removeClass(path, i+1);
        }, timeout*path[i].getCost());
    };
    var setStartClass = function(path, i) {
        if(i === path.length) {
            self.$graph.find("." + css.start).removeClass(css.start);
            elementFromNode(path[i-1]).addClass(css.start);
        }
    };
    var addClass = function(path, i) {
        if(i >= path.length) { // Kết thúc đường dẫn hiển thị, xóa đường dẫn
            return removeClass(path, 0);
        }
        elementFromNode(path[i]).addClass(css.active);
        setTimeout(function() {
            addClass(path, i+1);
        }, timeout*path[i].getCost());
    };

    addClass(path, 0);
    this.$graph.find("." + css.start).removeClass(css.start);
    this.$graph.find("." + css.finish).removeClass(css.finish).addClass(css.start);
};
