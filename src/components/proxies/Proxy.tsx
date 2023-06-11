import { TooltipPopup, useTooltip } from '@reach/tooltip';
import cx from 'clsx';
import * as React from 'react';

import { keyCodes } from '~/misc/keycode';
import { getLatencyTestUrl } from '~/store/app';
import { ProxyItem } from '~/store/types';

import { getDelay, getProxies } from '../../store/proxies';
import { connect } from '../StateProvider';
import s0 from './Proxy.module.scss';
import { ProxyLatency } from './ProxyLatency';

const { useMemo } = React;

const colorMap = {
  // green
  good: '#67c23a',
  // yellow
  normal: '#d4b75c',
  // orange
  bad: '#e67f3c',
  // red
  danger: '#ff8da1',
  // pink
  na: '#909399',
};

function getLabelColor(
  {
    number,
  }: {
    number?: number;
  } = {},
  httpsTest: boolean
) {
  const delayMap = {
    good: httpsTest ? 800 : 200,
    normal: httpsTest ? 1500 : 500,
    bad: httpsTest ? 2000 : 800,
    danger: httpsTest ? 2700 : 1200,
  };
  if (number === 0) {
    return colorMap.na;
  } else if (number < delayMap.good) {
    return colorMap.good;
  } else if (number < delayMap.normal) {
    return colorMap.normal;
  } else if (number < delayMap.bad) {
    return colorMap.bad;
  } else if (typeof number === 'number') {
    return colorMap.danger;
  }
  return colorMap.na;
}

function getProxyDotBackgroundColor(
  latency: {
    number?: number;
  },
  // proxyType: string,
  httpsTest: boolean
) {
  // if (NonProxyTypes.indexOf(proxyType) > -1) {
  //   return 'linear-gradient(135deg, white 15%, #999 15% 30%, white 30% 45%, #999 45% 60%, white 60% 75%, #999 75% 90%, white 90% 100%)';
  // }
  return getLabelColor(latency, httpsTest);
}

type ProxyProps = {
  name: string;
  now?: boolean;
  proxy: ProxyItem;
  latency: any;
  httpsLatencyTest: boolean;
  isSelectable?: boolean;
  udp: boolean;
  tfo: boolean;
  onClick?: (proxyName: string) => unknown;
};

function ProxySmallImpl({
  now,
  name,
  proxy,
  latency,
  httpsLatencyTest,
  isSelectable,
  onClick,
}: ProxyProps) {
  const delay = proxy.history[proxy.history.length - 1]?.delay;
  const latencyNumber = latency?.number ?? delay;
  const color = useMemo(
    () => getProxyDotBackgroundColor({ number: latencyNumber }, httpsLatencyTest),
    [latencyNumber]
  );

  const title = useMemo(() => {
    let ret = name;
    if (latency && typeof latency.number === 'number') {
      ret += ' ' + latency.number + ' ms';
    }
    return ret;
  }, [name, latency]);

  const doSelect = React.useCallback(() => {
    isSelectable && onClick && onClick(name);
  }, [name, onClick, isSelectable]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.keyCode === keyCodes.Enter) {
        doSelect();
      }
    },
    [doSelect]
  );

  return (
    <div
      title={title}
      className={cx(s0.proxySmall, {
        [s0.selectable]: isSelectable,
      })}
      style={{ background: color, scale: now ? '1.2' : '1' }}
      onClick={doSelect}
      onKeyDown={handleKeyDown}
      role={isSelectable ? 'menuitem' : ''}
    >
      {now && <div className={s0.now} />}
    </div>
  );
}

function formatProxyType(t: string) {
  if (t === 'Shadowsocks') return 'SS';
  return t;
}

const positionProxyNameTooltip = (triggerRect: { left: number; top: number }) => {
  return {
    left: triggerRect.left + window.scrollX - 5,
    top: triggerRect.top + window.scrollY - 38,
  };
};

function ProxyNameTooltip({ children, label, 'aria-label': ariaLabel }) {
  const [trigger, tooltip] = useTooltip();
  return (
    <>
      {React.cloneElement(children, trigger)}
      <TooltipPopup
        {...tooltip}
        label={label}
        aria-label={ariaLabel}
        position={positionProxyNameTooltip}
      />
    </>
  );
}

function ProxyImpl({
  now,
  name,
  proxy,
  latency,
  httpsLatencyTest,
  isSelectable,
  onClick,
}: ProxyProps) {
  const delay = proxy.history[proxy.history.length - 1]?.delay;
  const latencyNumber = latency?.number ?? delay;
  const color = useMemo(
    () => getLabelColor({ number: latencyNumber }, httpsLatencyTest),
    [latencyNumber]
  );

  const doSelect = React.useCallback(() => {
    isSelectable && onClick && onClick(name);
  }, [name, onClick, isSelectable]);
  function formatUdpType(udp: boolean, xudp?: boolean) {
    if (!udp) return '';
    return xudp ? 'XUDP' : 'UDP';
  }

  function formatTfo(t: boolean) {
    if (!t) return null;
    return (
      <svg
        fill={color}
        height="12"
        width="12"
        version="1.1"
        id="Capa_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 297.001 297.001"
        xml:space="preserve"
      >
        <path d="M273.522,123.76c12.609-23.496,15.184-45.727,7.625-66.157c-14.729-39.813-62.923-56.279-64.967-56.961c-6.523-2.174-13.571,1.351-15.744,7.872c-2.174,6.521,1.352,13.569,7.871,15.743c0.389,0.129,39.033,13.704,49.494,41.983c4.002,10.816,3.406,22.902-1.723,36.061c-30.392-26.224-76.002-25.169-97.522-22.876l-11.735-49.722c-0.777-3.294-2.862-6.129-5.774-7.851c-2.914-1.726-6.404-2.187-9.662-1.284L86.347,33.044L41.309,20.567c-3.307-0.915-6.847-0.426-9.781,1.355c-2.934,1.781-5.002,4.695-5.716,8.053l-12.92,61.187c-1.413,5.768-2.179,11.788-2.179,17.984c0,35.475,24.555,65.308,57.556,73.435c15.941,10.719,15.141,32.684,5.65,65.257c-7.006,24.049,5.287,39.699,19.674,44.065c14.669,4.454,33.45-2.381,39.489-21.519c8.102-25.679,21.541-36.41,30.587-37.799c3.007-0.46,5.561,0.12,6.512,1.48c1.071,1.531,0.884,5.384-1.951,10.538c-14.338,26.067-1.227,40.794,3.132,44.687c5.737,5.123,13.182,7.711,20.788,7.711c6.841-0.001,13.813-2.095,19.785-6.321c33.738-23.877,57.26-52.629,68.018-83.148C290.245,178.335,287.923,148.851,273.522,123.76zM35.605,109.146c0-27.979,22.763-50.741,50.741-50.741c27.979,0,50.742,22.762,50.742,50.741s-22.763,50.742-50.742,50.742C58.368,159.888,35.605,137.126,35.605,109.146z M197.555,270.361c-3.344,2.366-7.054,2.973-9.614,0.361c-3.056-3.116-1.485-7.605,2.1-14.123c7.35-13.363,7.548-26.775,0.542-36.796c-6.534-9.349-18.004-13.763-30.688-11.823c-21.862,3.354-40.76,23.882-50.552,54.912c-1.771,5.612-6.35,5.849-8.522,5.189c-5.858-1.777-3.779-10.615-3.002-13.28c5.388-18.496,14.077-48.343,3.18-71.458c34.716-6.843,60.983-37.505,60.983-74.197c0-1.688-0.076-3.357-0.186-5.018c20.675-2.125,66.994-3.015,87.482,27.719C276.89,173.262,256.102,228.926,197.555,270.361z"/>
      </svg>
    );
  }
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.keyCode === keyCodes.Enter) {
        doSelect();
      }
    },
    [doSelect]
  );
  const className = useMemo(() => {
    return cx(s0.proxy, {
      [s0.now]: now,
      [s0.error]: latency && latency.error,
      [s0.selectable]: isSelectable,
    });
  }, [isSelectable, now, latency]);

  // const latencyNumber = latency?.number ?? proxy.history[proxy.history.length - 1]?.delay;

  return (
    <div
      tabIndex={0}
      className={className}
      onClick={doSelect}
      onKeyDown={handleKeyDown}
      role={isSelectable ? 'menuitem' : ''}
    >
      <div className={cx(s0.proxyName, s0.row)}>
        <ProxyNameTooltip label={name} aria-label={`proxy name: ${name}`}>
          <span>{name}</span>
        </ProxyNameTooltip>
      </div>

      <div className={s0.row}>
        <div className={s0.row}>
          <span
            className={`${s0.proxyType} ${s0.tfoLabel}`}
            style={{
              padding: '2px 2px',
              paddingRight: 2,
              paddingLeft: 2,
              color: '#ffffff',
              opacity: 0.6,
              backgroundColor: '#6da2b5',
              borderRadius: 2,
              fontWeight: '',
              fontStyle: '',
            }}
          >
            {formatProxyType(proxy.type)}
          </span>
          &nbsp;
          <span
            className={`${s0.proxyType} ${s0.tfoLabel}`}
            style={{
              padding: '2px 2px',
              paddingRight: 2,
              paddingLeft: 2,
              opacity: 0.6,
              color: '#ffffff',
              backgroundColor: color,
              borderRadius: 2,
              fontWeight: '',
              fontStyle: '',
            }}
          >
            {formatUdpType(proxy.udp, proxy.xudp)}
          </span>
          &nbsp;{formatTfo(proxy.tfo)}
        </div>
        {latencyNumber ? <ProxyLatency number={latencyNumber} color={color} /> : null}
      </div>
    </div>
  );
}

const mapState = (s: any, { name }) => {
  const proxies = getProxies(s);
  const delay = getDelay(s);
  const latencyTestUrl = getLatencyTestUrl(s);
  const proxy = proxies[name] || { name, history: [] };
  return {
    proxy: proxy,
    latency: delay[name],
    httpsLatencyTest: latencyTestUrl.startsWith('https://'),
  };
};

export const Proxy = connect(mapState)(ProxyImpl);
export const ProxySmall = connect(mapState)(ProxySmallImpl);
