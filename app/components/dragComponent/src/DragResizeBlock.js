import React, { Component } from 'react';
import {
  Dimensions,
  View,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import PropTypes from 'prop-types';

import {
  Connector,
  CONNECTOR_TOP_LEFT,
  CONNECTOR_TOP_MIDDLE,
  CONNECTOR_TOP_RIGHT,
  CONNECTOR_MIDDLE_RIGHT,
  CONNECTOR_BOTTOM_RIGHT,
  CONNECTOR_BOTTOM_MIDDLE,
  CONNECTOR_BOTTOM_LEFT,
  CONNECTOR_MIDDLE_LEFT,
  CONNECTOR_CENTER,
  CONNECTOR_ENTIRE,
} from './Connector';

export const AXIS_X = 'x';
export const AXIS_Y = 'y';
export const AXIS_ALL = 'all';

const CONNECTOR_SIZE = 18;
const DEFAULT_Z_INDEX = 1;
const element_width = 60;
const element_height = 35;
const element_width_space = 0;
const element_height_space = 0;
/**
 * Drag resize block.
 */
import { connect } from 'react-redux';
import { AllowAlertAction } from '../../../store/redux/userAction'
class DragResizeBlockClass extends Component {

  constructor(props) {
    super(props);

    const {
      x,
      y,
      w,
      h,
      minW,
      minH,
      leftSize,
      reservationStatus
    } = props;

    this.state = {
      isSelected: false,
      x,
      y,
      w: w < minW ? minW : w,
      h: h < minH ? minH : h,
      vx: 0,
      vy: 0,
    };

    /**
     * Connectors binding.
     */
    this.connectorsMap = {};

    /**
     * Top left connector.
     */
    this.connectorsMap[CONNECTOR_TOP_LEFT] = {
      calculateX: (width) => {
        return 0;
      },
      calculateY: (height) => {
        return 0;
      },
      onStart: this.onResizeStart,
      onMove: this.onResizeTL,
      onEnd: this.onResizeEnd,
    };

    /**
     * Top middle connector.
     */
    this.connectorsMap[CONNECTOR_TOP_MIDDLE] = {
      calculateX: (width) => {
        return width / 2 - CONNECTOR_SIZE / 2;
      },
      calculateY: (height) => {
        return 0;
      },
      onStart: this.onResizeStart,
      onMove: this.onResizeTM,
      onEnd: this.onResizeEnd,
    };

    /**
     * Top right connector.
     */
    this.connectorsMap[CONNECTOR_TOP_RIGHT] = {
      calculateX: (width) => {
        return width - CONNECTOR_SIZE;
      },
      calculateY: (height) => {
        return 0;
      },
      onStart: this.onResizeStart,
      onMove: this.onResizeTR,
      onEnd: this.onResizeEnd,
    };

    /**
     * Middle right connector.
     */
    this.connectorsMap[CONNECTOR_MIDDLE_RIGHT] = {
      calculateX: (width) => {
        return width - CONNECTOR_SIZE;
      },
      calculateY: (height) => {
        return height / 2 - CONNECTOR_SIZE / 2;
      },
      onStart: this.onResizeStart,
      onMove: this.onResizeMR,
      onEnd: this.onResizeEnd,
    };

    /**
     * Bottom right connector.
     */
    this.connectorsMap[CONNECTOR_BOTTOM_RIGHT] = {
      calculateX: (width) => {
        return width - CONNECTOR_SIZE;
      },
      calculateY: (height) => {
        return height - CONNECTOR_SIZE;
      },
      onStart: this.onResizeStart,
      onMove: this.onResizeBR,
      onEnd: this.onResizeEnd,
    };

    /**
     * Bottom middle connector.
     */
    this.connectorsMap[CONNECTOR_BOTTOM_MIDDLE] = {
      calculateX: (width) => {
        return width / 2 - CONNECTOR_SIZE / 2;
      },
      calculateY: (height) => {
        return height - CONNECTOR_SIZE;
      },
      onStart: this.onResizeStart,
      onMove: this.onResizeBM,
      onEnd: this.onResizeEnd,
    };

    /**
     * Bottom left connector.
     */
    this.connectorsMap[CONNECTOR_BOTTOM_LEFT] = {
      calculateX: (width) => {
        return 0;
      },
      calculateY: (height) => {
        return height - CONNECTOR_SIZE;
      },
      onStart: this.onResizeStart,
      onMove: this.onResizeBL,
      onEnd: this.onResizeEnd,
    };

    /**
     * Middle left connector.
     */
    this.connectorsMap[CONNECTOR_MIDDLE_LEFT] = {
      calculateX: (width) => {
        return 0;
      },
      calculateY: (height) => {
        return height / 2 - CONNECTOR_SIZE / 2;
      },
      onStart: this.onResizeStart,
      onMove: this.onResizeML,
      onEnd: this.onResizeEnd,
    };

    /**
     * Center connector.
     */
    this.connectorsMap[CONNECTOR_CENTER] = {
      calculateX: (width) => {
        return width / 2 - CONNECTOR_SIZE / 2;
      },
      calculateY: (height) => {
        return height / 2 - CONNECTOR_SIZE / 2;
      },
      onStart: this.onDragStart,
      onMove: this.onDrag,
      onEnd: this.onDragEnd,
    };
    this.connectorsMap[CONNECTOR_ENTIRE] = {
      calculateX: (width) => {
        return 0;
      },
      calculateY: (height) => {
        return 0;
      },
      onStart: this.onDragStart,
      onMove: this.onDrag,
      onEnd: this.onDragEnd,
    };
  }

  /**
   * Handle press event.
   * @param {Event} event - Press event.
   */
  onPress = (event) => {
    const {
      onPress,
    } = this.props;

    if (onPress !== null) {
      onPress(event);
    }
  }

  /**
   * Handle resize start event.
   * @param {Array} coord - Press coordinate [x,y].
   */
  onResizeStart = (coord) => {
    const {
      onResizeStart,
    } = this.props;

    this.setState(() => {
      return {
        isSelected: true,
      };
    });

    if (onResizeStart !== null) {
      onResizeStart([
        this.state.x,
        this.state.y,
      ]);
    }
  }

  onResizeTL = (coord) => {
    const {
      minW,
      minH,
      axis,
      isResizable,
      limitation,
      onResize,
    } = this.props;

    if (!isResizable) {
      return;
    }

    this.setState(() => {
      const newX = this.state.x + coord[0];
      const newY = this.state.y + coord[1];
      const newW = this.state.x + this.state.w - newX;
      const newH = this.state.y + this.state.h - newY;

      if (newW >= minW && axis != AXIS_Y) {
        if (limitation.x <= newX) {
          this.state.w = newW;
          this.state.x = newX;
        }
      }

      if (newH >= minH && axis != AXIS_X) {
        if (limitation.y <= newY) {
          this.state.h = newH;
          this.state.y = newY;
        }
      }

      if (onResize !== null) {
        onResize([
          this.state.x,
          this.state.y,
        ]);
      }

      return this.state;
    });
  }

  onResizeTM = (coord) => {
    const {
      minH,
      axis,
      isResizable,
      limitation,
      onResize,
    } = this.props;

    if (!isResizable) {
      return;
    }

    this.setState(() => {
      const newY = this.state.y + coord[1];
      const newH = this.state.y + this.state.h - newY;

      if (newH >= minH && axis != AXIS_X) {
        if (limitation.y <= newY) {
          this.state.h = newH;
          this.state.y = newY;
        }
      }

      if (onResize !== null) {
        onResize([
          this.state.x,
          this.state.y,
        ]);
      }

      return this.state;
    });
  }

  onResizeTR = (coord) => {
    const {
      minW,
      minH,
      axis,
      isResizable,
      limitation,
      onResize,
    } = this.props;

    if (!isResizable) {
      return;
    }

    this.setState(() => {
      const newY = this.state.y + coord[1];
      const newW = this.state.w + coord[0];
      const newH = this.state.y + this.state.h - newY;

      if (newW >= minW && axis != AXIS_Y) {
        if (limitation.w >= this.state.x + newW) {
          this.state.w = newW;
        }
      }

      if (newH >= minH && axis != AXIS_X) {
        if (limitation.y <= newY) {
          this.state.h = newH;
          this.state.y = newY;
        }
      }

      if (onResize !== null) {
        onResize([
          this.state.x,
          this.state.y,
        ]);
      }

      return this.state;
    });
  }

  onResizeMR = (coord) => {
    const {
      minW,
      axis,
      isResizable,
      limitation,
      onResize,
      reservationStatus,
      leftSize
    } = this.props;

    if (!isResizable) {
      return;
    }

    this.setState(() => {
      const newW = this.state.w + coord[0];

      if (axis != AXIS_Y) {

        this.state.w = newW;
      }

      if (onResize !== null) {
        onResize([
          this.state.x,
          this.state.y,
        ]);
      }

      return this.state;
    });
  }

  onResizeBR = (coord) => {
    const {
      minW,
      minH,
      axis,
      isResizable,
      limitation,
      onResize,
    } = this.props;

    if (!isResizable) {
      return;
    }

    this.setState(() => {
      const newW = this.state.w + coord[0];
      const newH = this.state.h + coord[1];

      if (newW >= minW && axis != AXIS_Y) {
        if (limitation.w >= this.state.x + newW) {
          this.state.w = newW;
        }
      }

      if (newH >= minH && axis != AXIS_X) {
        if (limitation.h >= this.state.y + newH) {
          this.state.h = newH;
        }
      }

      if (onResize !== null) {
        onResize([
          this.state.x,
          this.state.y,
        ]);
      }

      return this.state;
    });
  }

  onResizeBM = (coord) => {
    const {
      minH,
      axis,
      isResizable,
      limitation,
      onResize,
    } = this.props;

    if (!isResizable) {
      return;
    }

    this.setState(() => {
      const newH = this.state.h + coord[1];

      if (newH >= minH && axis != AXIS_X) {
        if (limitation.h >= this.state.y + newH) {
          this.state.h = newH;
        }
      }

      if (onResize !== null) {
        onResize([
          this.state.x,
          this.state.y,
        ]);
      }

      return this.state;
    });
  }

  onResizeBL = (coord) => {
    const {
      minW,
      minH,
      axis,
      isResizable,
      limitation,
      onResize,
    } = this.props;

    if (!isResizable) {
      return;
    }

    this.setState(() => {
      const newX = this.state.x + coord[0];
      const newW = this.state.x + this.state.w - newX;
      const newH = this.state.h + coord[1];

      if (newW >= minW && axis != AXIS_Y) {
        if (limitation.x <= newX) {
          this.state.w = newW;
          this.state.x = newX;
        }
      }

      if (newH >= minH && axis != AXIS_X) {
        if (this.state.y + newH <= limitation.h) {
          this.state.h = newH;
        }
      }

      if (onResize !== null) {
        onResize([
          this.state.x,
          this.state.y,
        ]);
      }

      return this.state;
    });
  }

  onResizeML = (coord) => {
    const {
      minW,
      axis,
      isResizable,
      limitation,
      onResize,
    } = this.props;

    if (!isResizable) {
      return;
    }
    this.setState(() => {
      const newX = this.state.x + coord[0];
      const newW = this.state.x + this.state.w - newX;

      if (newW >= minW && axis != AXIS_Y) {
        if (limitation.x <= newX) {
          this.state.w = newW;
          this.state.x = newX;
        }
      }

      if (onResize !== null) {
        onResize([
          this.state.x,
          this.state.y,
        ]);
      }
      return this.state;
    });
  }

  /**
   * Handle resize end event.
   * @param {Array} coord - Press coordinate [x,y].
   */
  onResizeEnd = (coord) => {
    const {
      onResizeEnd,
      leftSize,
      reservationStatus
    } = this.props;
    this.setState(() => {
      let newW = Math.round((this.state.w - element_width_space) / element_width) * element_width + element_width_space + element_width_space;
      this.state.x = Math.round((this.state.x - element_width_space) / element_width) * element_width - element_width_space;
      const { dispatch } = this.props;
      if (reservationStatus === "booked" || reservationStatus === "draft") {
        let endW = (Math.round(newW / 60) * 60) + this.state.x;
        if (endW < leftSize * 4) {
          // Alert.alert(
          //   "INFO",
          //   "You are not allow to create reservation if is before present time.\nReconsider your choise",
          //   [
          //     { text: "Close", onPress: () => console.log("OK Pressed") }
          //   ]
          // );
          this.state.w = newW;
          dispatch(AllowAlertAction(true));
        } else {
          this.state.w = newW;
          dispatch(AllowAlertAction(false));
        }
      } else {
        this.state.w = newW;
        dispatch(AllowAlertAction(false));
      }
      return this.state;
    });
    this.setState(() => {
      return {
        isSelected: false,
      };
    });

    if (onResizeEnd !== null) {
      onResizeEnd([
        this.state.x,
        this.state.y,
        this.state.w,
        this.state.h
      ]);
    }
  }

  /**
   * Handle drag start event.
   * @param {Array} coord - Press coordinate [x,y].
   */
  onDragStart = (coord) => {
    const {
      onDragStart,
    } = this.props;

    this.setState(() => {
      return {
        isSelected: true,
      };
    });

    if (onDragStart !== null) {
      onDragStart([
        this.state.x,
        this.state.y,
      ]);
    }
  }

  /**
   * Handle drag event.
   * @param {Array} coord - Press coordinate [x,y].
   */
  onDrag = (coord) => {
    const {
      axis,
      isDraggable,
      limitation,
      onDrag,
      leftSize,
      reservationStatus
    } = this.props;

    if (!isDraggable) {
      return;
    }

    this.setState(() => {
      const newX = this.state.x + coord[0];
      const newY = this.state.y + coord[1];
      this.state.vx = coord[2];
      this.state.vy = coord[3];
      if (axis != AXIS_Y) {
        if (limitation.x <= newX && limitation.w >= newX + this.state.w) {
        }
        this.state.x = newX;
      }

      if (axis != AXIS_X) {
        this.state.y = newY;
        if (limitation.y <= newY && limitation.h >= newY + this.state.h) {
        }
      }

      if (onDrag !== null) {
        onDrag([
          this.state.x,
          this.state.y,
          this.state.vx,
          this.state.vy
        ]);
      }

      return this.state;
    });
  }

  /**
   * Handle drag end event.
   * @param {Array} coord - Press coordinate [x,y].
   */
  onDragEnd = (coord) => {
    const {
      onDragEnd,
      leftSize,
      reservationStatus,
      dispatch,
      todayDate,
      selectedDate,
      x
    } = this.props;
    console.log("dragStatus--------------->", leftSize, reservationStatus, x)
    let newX = Math.round((this.state.x + element_width_space) / element_width) * element_width - element_width_space;
    this.state.y = Math.round((this.state.y + element_height_space) / element_height) * element_height - element_height_space;
    if (reservationStatus === "booked") {
      let endX = (Math.round(newX / 60) * 60) + this.state.w;
      if (endX < leftSize * 4) {
        // Alert.alert(
        //   "INFO",
        //   "You are not allow to do this change, the entire reservation is before present time.\n Reconsider your choise",
        //   [
        //     { text: "Close", onPress: () => console.log("OK Pressed") }
        //   ]
        // );
        dispatch(AllowAlertAction(true));
      } else {
        dispatch(AllowAlertAction(false));
        console.log("------------------->2")
      }
      this.state.x = newX;
    } else {
      this.state.x = x;
    }
    // if (reservationStatus === "occupied") {
    // }
    this.setState(() => {
      return {
        isSelected: false,
      };
    });
    if (onDragEnd !== null) {
      onDragEnd([
        this.state.x,
        this.state.y,
      ]);
    }
  }

  /**
   * Render connector components.
   */
  renderConnectors = () => {
    const {
      connectors,
    } = this.props;

    const {
      w,
      h,
    } = this.state;

    return connectors.map((connectorType) => {
      return (
        <Connector
          key={connectorType}
          type={connectorType}
          size={CONNECTOR_SIZE}
          width={this.state.w}
          height={35}
          x={this.connectorsMap[connectorType].calculateX(w)}
          y={this.connectorsMap[connectorType].calculateY(h)}
          onStart={this.connectorsMap[connectorType].onStart}
          onMove={this.connectorsMap[connectorType].onMove}
          onEnd={this.connectorsMap[connectorType].onEnd}
        />
      );
    });
  }

  render() {
    const {
      children,
      isDisabled,
      zIndex,
    } = this.props;

    const {
      x,
      y,
      w,
      h,
      isSelected,
    } = this.state;
    return (
      <View
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: w,
          height: 35,
          zIndex: isSelected ? zIndex + 1 : zIndex,
        }}
      >
        <TouchableWithoutFeedback
          onPress={this.onPress}
        >
          <View
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            {children}
          </View>
        </TouchableWithoutFeedback>

        {isDisabled ? null : this.renderConnectors()}

      </View>
    );
  }
}
export const DragResizeBlock = connect(({ userReducer }) => ({ userReducer }))(DragResizeBlockClass);
DragResizeBlock.defaultProps = {
  x: 0,
  y: 0,
  w: 100,
  h: 100,
  minW: 50,
  minH: 50,
  axis: AXIS_ALL,
  limitation: {
    x: 0,
    y: 0,
    w: Dimensions.get('window').width,
    h: Dimensions.get('window').height,
  },
  isDisabled: false,
  zIndex: DEFAULT_Z_INDEX,
  isDraggable: true,
  isResizable: true,
  connectors: [
    CONNECTOR_TOP_LEFT,
    CONNECTOR_TOP_MIDDLE,
    CONNECTOR_TOP_RIGHT,
    CONNECTOR_MIDDLE_RIGHT,
    CONNECTOR_BOTTOM_RIGHT,
    CONNECTOR_BOTTOM_MIDDLE,
    CONNECTOR_BOTTOM_LEFT,
    CONNECTOR_MIDDLE_LEFT,
    CONNECTOR_CENTER,
    CONNECTOR_ENTIRE,
  ],

  onPress: null,
  onDragStart: null,
  onDrag: null,
  onDragEnd: null,
  onResizeStart: null,
  onResize: null,
  onResizeEnd: null,
};

DragResizeBlock.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  w: PropTypes.number,
  h: PropTypes.number,
  minW: PropTypes.number,
  minH: PropTypes.number,
  zIndex: PropTypes.number,
  axis: PropTypes.oneOf([
    AXIS_X,
    AXIS_Y,
    AXIS_ALL,
  ]),
  limitation: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    w: PropTypes.number.isRequired,
    h: PropTypes.number.isRequired,
  }),
  isDisabled: PropTypes.bool,
  isDraggable: PropTypes.bool,
  isResizable: PropTypes.bool,
  connectors: PropTypes.array,

  onPress: PropTypes.func,
  onDragStart: PropTypes.func,
  onDrag: PropTypes.func,
  onDragEnd: PropTypes.func,
  onResizeStart: PropTypes.func,
  onResize: PropTypes.func,
  onResizeEnd: PropTypes.func,
};
