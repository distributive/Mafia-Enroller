$(document).ready (() => {
    // General
    $("#error-close").click (hideError);

    $(".button-home").click (() => {
        showHome ();
        socket.emit ("returnedHome");
    });



    // Home
    $("#create-submit").click (function () {
        socket.emit ("createLobby");
    });

    socket.on ("lobbyCreated", (joinCode) => {
        setCode (joinCode);
        showCreate ();
    });

    $("#join-submit").click (function () {
        let name = $("#join-name").val ();
        let code = $("#join-code").val ().toUpperCase ();
        setCode (code);
        socket.emit ("joinLobby", name, code);
    });

    socket.on ("joinFailed", reason => {
        showJoinError (reason);
    });

    socket.on ("joinSuccessful", () => {
        showJoin ();
        hideJoinError ();
    });



    // Join
    socket.on ("lobbyClosed", () => {
        showError ("Lobby closed", "The moderator has left the lobby.")
    });

    socket.on ("setRole", (role) => {
        showRole (role.title, role.description, role.condition, factionToClass (role.faction));
    });



    // Create
    $("#create-start").click (function () {
        let game = {};
        $("#role-list .entry").each (function (i) {
            let roleName = $(this).find (".entry-name").html ().trim ();
            let count = parseInt ($(this).find (".entry-count").html ().trim ());

            if (count > 0)
                game[roleName] = count;
        });

        socket.emit ("startGame", game);
    });

    socket.on ("gameAccepted", () => {
        $("#create-start").hide ();
    });

    socket.on ("gameRejected", (reason) => {
        showError ("Game rejected", reason);
    });

    socket.on ("addPlayer", (name) => {
        addPlayer (name);
    });

    socket.on ("removePlayer", (name) => {
        removePlayer (name);
    });

    socket.on ("setRoles", (roles) => {
        roleLibrary = roles;
        displayRoles ();
    });

    $("#search-text").on ("input", reloadRoles);
    $("#role-search input").change (reloadRoles);
    function reloadRoles ()
    {
        let enabledFactions = getEnabledFactions ();

        let input = $("#search-text").val ().toLowerCase ();
        let queries = []
            .concat (input.split (",").map (s => s.trim ()).filter (s => s))
            .concat (input.split ("  ").map (s => s.trim ()).filter (s => s));
        if (queries.length == 0)
            queries = [""];

        displayRoles (roleName => enabledFactions.has (roleLibrary[roleName].faction) && queries.some (query => roleName.toLowerCase ().includes (query)));
    }
});



// General
function showError (header, body)
{
    $("#error-header").html (header);
    $("#error-body").html (body);

    $("#fader").show ();
    $("#error-container").show ();
}

function hideError ()
{
    $("#fader").hide ();
    $("#error-container").hide ();
}



// Home
function showHome ()
{
    $("main").hide ();
    $("main#home").show ();
}

function showJoinError (message)
{
    $("#join-error").html (message).show ();
}

function hideJoinError ()
{
    $("#join-error").hide ();
}



// Code
function setCode (code)
{
    $(".code span").html (code);
}



// Join
function showJoin ()
{
    hideRole ();

    $("main").hide ();
    $("main#join").show ();
}

function showRole (name, description, condition, faction)
{
    $("main#join h1").html ("You are:");

    $("#role-wait").hide ();
    $("main#join .code").hide ();

    $("#role-name").html (name).removeClass ().addClass (faction).show ();
    $("#role-description").html (description).show ();
    $("#role-condition").html (condition).show ();
}

function hideRole ()
{
    $("main#join h1").html ("Please wait");

    $("#role-name").hide ();
    $("#role-description").hide ();
    $("#role-condition").hide ();

    $("#role-wait").show ();
    $("main#join .code").show ();
}



// Create
function showCreate ()
{
    $("#search-text").val ("");
    displayRoles ();

    $("#create-start").show ();
    $("#player-list").empty ();
    $(".entry-count").html (0)

    $("main").hide ();
    $("main#create").show ();
}

let playerHTML = `<li class="entry"><span>#name</span></li>`;

function addPlayer (name)
{
    $("#player-list").append (playerHTML.replace ("#name", name));
}

function removePlayer (name)
{
    name = name.toLowerCase ();
    $("#player-list .entry span").filter (function (i) {return $(this).html ().trim ().toLowerCase () == name;}).parent ().remove ();
}

let roleHTML = `<li class="entry"><span class="entry-name">#name</span><button class="entry-dec">-</button><span class="entry-count">0</span><button class="entry-inc">+</button></li>`;

let roleLibrary = {};

function displayRoles (filter)
{
    if (filter == null)
        filter = _ => true;

    $("#role-list").empty ();

    Object.keys (roleLibrary).filter (filter).forEach ((name) => {
        $("#role-list").append (roleHTML.replace ("#name", name));
    });

    // Update click events
    $(".entry-inc").click (function () {
        let count = $(this).parent ().find (".entry-count");
        count.html (parseInt (count.html ()) + 1);
    });

    $(".entry-dec").click (function () {
        let count = $(this).parent ().find (".entry-count");
        count.html (Math.max (0, parseInt (count.html ()) - 1));
    });
}

function getEnabledFactions ()
{
    return new Set ($("#role-search label input").filter ((i, e) => e.checked).map ((i, e) => $(e).parent ().attr ("name")));
}



// Sockets
let socket = io ();
