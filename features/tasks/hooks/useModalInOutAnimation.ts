import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';

type EasingFn = (value: number) => number;

interface Params {
  visible: boolean;
  translateY?: { from: number; to: number };
  inDuration?: number;
  outDuration?: number;
  easingIn?: EasingFn;
  easingOut?: EasingFn;
  onClosed?: () => void;
}

interface Response {
  open: boolean;
  backdropStyle: { opacity: Animated.Value };
  cardStyle: { transform: { translateY: Animated.Value }[]; opacity: Animated.Value };
  fade: Animated.Value;
  translate: Animated.Value;
}

type OptionalProps = Omit<Params, 'visible' | 'onClosed'>;
const defaults: Required<OptionalProps> = {
  translateY: { from: 20, to: 0 },
  inDuration: 220,
  outDuration: 180,
  easingIn: Easing.out(Easing.quad),
  easingOut: Easing.in(Easing.quad),
};

const useModalInOutAnimation = (props: Params): Response => {
  const { visible, translateY, inDuration, outDuration, easingIn, easingOut, onClosed } = {
    ...defaults,
    ...props,
  };
  const [open, setOpen] = useState(visible);
  const translate = useRef(new Animated.Value(translateY.from)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      if (!open) setOpen(true);

      Animated.parallel([
        Animated.timing(translate, {
          toValue: translateY.to,
          duration: inDuration,
          easing: easingIn,
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 1,
          duration: Math.max(0, inDuration - 60),
          easing: easingIn,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (open) {
      Animated.parallel([
        Animated.timing(translate, {
          toValue: translateY.from,
          duration: outDuration,
          easing: easingOut,
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 0,
          duration: Math.max(0, outDuration - 60),
          easing: easingOut,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setOpen(false);
          onClosed?.();
        }
      });
    }
  }, [
    visible,
    open,
    translate,
    fade,
    translateY.from,
    translateY.to,
    inDuration,
    outDuration,
    easingIn,
    easingOut,
    onClosed,
  ]);

  const backdropStyle = { opacity: fade };
  const cardStyle = { transform: [{ translateY: translate }], opacity: fade };

  return { open, backdropStyle, cardStyle, fade, translate };
};

export { useModalInOutAnimation };
