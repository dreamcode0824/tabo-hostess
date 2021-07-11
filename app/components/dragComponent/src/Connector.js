import React, { Component } from 'react';
import {
  PanResponder,
  View,
} from 'react-native';
import PropTypes from 'prop-types';

export const CONNECTOR_TOP_LEFT = 'tl';
export const CONNECTOR_TOP_MIDDLE = 'tm';
export const CONNECTOR_TOP_RIGHT = 'tr';
export const CONNECTOR_MIDDLE_RIGHT = 'mr';
export const CONNECTOR_BOTTOM_RIGHT = 'br';
export const CONNECTOR_BOTTOM_MIDDLE = 'bm';
export const CONNECTOR_BOTTOM_LEFT = 'bl';
export const CONNECTOR_MIDDLE_LEFT = 'ml';
export const CONNECTOR_CENTER = 'c';
export const CONNECTOR_ENTIRE = 'e';

/**
 * Connector component for handle touch events.
 */
export class Connector extends Component {

  constructor(props) {
    super(props);

    this.position = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
    };

    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (event, gestureState) => true,
      onStartShouldSetPanResponderCapture: (event, gestureState) => true,
      onMoveShouldSetPanResponder: (event, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (event, gestureState) => true,

      onPanResponderGrant: (event, gestureState) => {
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now
        const {
          onStart
        } = this.props;

        this.position = {
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
        };

        onStart([
          0,
          0,
        ]);
      },
      onPanResponderMove: (event, gestureState) => {
        const {
          onMove
        } = this.props;

        onMove([
          gestureState.dx - this.position.x,
          gestureState.dy - this.position.y,
          gestureState.vx,
          gestureState.vy
        ]);

        this.position = {
          x: gestureState.dx,
          y: gestureState.dy,
          vx: gestureState.vx,
          vy: gestureState.vy,
        };
      },
      onPanResponderTerminationRequest: (event, gestureState) => true,
      onPanResponderRelease: (event, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
        const {
          onEnd
        } = this.props;

        onEnd([
          gestureState.moveX,
          gestureState.moveY,
        ]);
      },
      onPanResponderTerminate: (event, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      onShouldBlockNativeResponder: (event, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    });
  }

  render() {
    const {
      x,
      y,
      size,
      width,
      height
    } = this.props;
    return (
      <>
        {this.props.type === "e" ? (
          <View
            style={{
              position: 'absolute',
              left: 28,
              top: 0,
              width: width - 55,
              height: height,
              //borderWidth: 1,
              //borderColor: '#CC8C35',
              backgroundColor: 'transparent'
            }}
            {...this._panResponder.panHandlers}
          />
        ) : (
          <React.Fragment>
            <View
              style={{
                position: 'absolute',
                left: x,
                top: 9,
                width: 18,
                height: 18,
                borderWidth: 2,
                borderRadius: 18,
                borderColor: '#CC8C35',
                backgroundColor: '#CC8C35'
              }}
            />
            <View
              style={{
                position: 'absolute',
                left: x,
                // right:x,
                top: 4,
                width: 28,
                height: 28,
                borderWidth: 2,
                borderRadius: 28,
                borderColor: 'rgba(204,140,53,0)',
                backgroundColor: 'rgba(204,140,53,0)',
              }}
              {...this._panResponder.panHandlers}
            />
          </React.Fragment>
        )}
      </>
    );
  }
}

Connector.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  size: PropTypes.number,
  onStart: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onEnd: PropTypes.func.isRequired,
};
