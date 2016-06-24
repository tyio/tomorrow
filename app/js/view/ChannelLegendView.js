/**
 * Created by Alex on 24/06/2016.
 */

/**
 *
 * @param {List.<ChannelView>} channelViews
 * @constructor
 */
function ChannelLegendView(channelViews) {
    var el = this.el = document.createElement('div');
    this.el.classList.add('channel-legend');


    function addChannel(v) {
        var vEl = document.createElement('div');
        vEl.classList.add('channel');

        var elLabel = document.createElement('div');
        elLabel.classList.add('label');

        var elMarker = document.createElement('div');
        elMarker.classList.add('marker');

        vEl.appendChild(elMarker);
        vEl.appendChild(elLabel);

        //
        elLabel.innerText = v.channel.name;
        elMarker.style.backgroundColor = v.style.color;

        el.appendChild(vEl);
    }

    function removeChannel(v) {

    }

    channelViews.forEach(addChannel);
}

module.exports = ChannelLegendView;