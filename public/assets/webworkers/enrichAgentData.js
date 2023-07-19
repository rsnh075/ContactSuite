
self.addEventListener('message', evt => {
  const agents          = evt.data.data,
        routinggroups   = evt.data.routingGroups,
        selRgIds        = evt.data.selectedRoutingGroups,
        statusList      = evt.data.statusList,
        coachable       = evt.data.coachable,
        agentsPinned    = evt.data.pinnedAgents,
        showOffQueue    = evt.data.showOffQueue,
        showTimeInSec   = evt.data.showTimeInSec,
        alertStatus     = evt.data.alertStatus,
        alertTreshold   = evt.data.alertTreshold,
        queueIds        = [2, 3, 4];

  let   pinnedAgents    = [],
        offQuequeAgents = [],
        qTotal          = 0,
        totalCalls      = 0,
        totAct          = 0,
        totAwt          = 0,
        totAht          = 0,
        totPause        = 0;

  const durationTime  = sec => new Date(sec * 1000).toISOString().substr(11, 8);

  const dynamicSort = property => {
    let sortOrder = 1;
    if(property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return (a, b) => {
      if(isNaN(a[property]) || typeof a[property] === "boolean" || a[property] == null || a[property] == '') {
        let _a = String(a[property]),
            _b = String(b[property]);
        let result = (_a.toLowerCase() < _b.toLowerCase()) ? -1 : (_a.toLowerCase() > _b.toLowerCase())  ? 1 : 0;
        return result * sortOrder;
      } else {
        let _a = parseInt(a[property]),
            _b = parseInt(b[property]);
        let result = (_a < _b) ? -1 : (_a > _b)  ? 1 : 0;
        return result * sortOrder;
      }
    }
  }
  
  const dynamicSortMultiple = (...theArgs) => {
    let props = theArgs;
    return (obj1, obj2) => {
      let i = 0, 
      result = 0, 
      numberOfProperties = props.length;
      while(result === 0 && i < numberOfProperties) {
        result = dynamicSort(props[i])(obj1, obj2);
        i++;
      }
      return result;
    }
  }

  const getStatusCharacteristics = id => {
    let _status = statusList.find(status => status.StatusId == id),
        _result;        
    if(_status) {
      _result = {
        color : `#${_status.Color}`,
        label : _status.Label
      };
    } else {
      _result = {
        color : '#FFFFFF',
        label : '-'
      };
    }
    return _result;
  };

  const statusAlert = (status, statusTime) => status == alertStatus && statusTime > (alertTreshold * 60);

  const _checkIfAgentIsInRoutingGroup = (agentRoutinggroups, selRgIds) => {
    if(agentRoutinggroups.length > 0 && selRgIds.length > 0) {
      return agentRoutinggroups.some(rgId => selRgIds.includes(rgId));
    } else {
      return true;
    }
  };

  const setPinIcon = UserId => {
    return agentsPinned.indexOf(UserId) !== -1; 
  }

  const enrichAgent = agent => {
    let _agent             = {...agent},
        _status            = getStatusCharacteristics(_agent.StatusId),
        _break             = _agent.StatusTijden.find(status => status.StatusId == 8);
    _agent.GebruikerNaam   = _agent.GebruikerNaam.replace(/\s{2,}/g, ' ');
    _agent.initials        = _agent.GebruikerNaam.split(" ").map((name, index, array)=> index === 0 || index + 1 === array.length ? name[0] : null).join("");
    _agent.statusColor     = _status.color;
    _agent.statusLabel     = _status.label;
    _agent.startTime       = _agent.StatusSeconden;
    _agent.StatusSeconden  = showTimeInSec ? Math.round(_agent.startTime) : durationTime(_agent.startTime);
    _agent.pinIcon         = setPinIcon(_agent.GebruikerId);
    _agent.ATT             = showTimeInSec ? 
                              Math.round((_agent.TotaleGespreksTijd > 0 && _agent.AantalCalls > 0) ? Math.round(_agent.TotaleGespreksTijd/_agent.AantalCalls) : 0) 
                              : 
                              durationTime((_agent.TotaleGespreksTijd > 0 && _agent.AantalCalls > 0) ? Math.round(_agent.TotaleGespreksTijd/_agent.AantalCalls) : 0);
    _agent.AWT             = showTimeInSec ? 
                              Math.round((_agent.TotaleWrapupTijd > 0 && _agent.AantalCalls > 0) ? Math.round(_agent.TotaleWrapupTijd/_agent.AantalCalls) : 0) 
                              : 
                              durationTime((_agent.TotaleWrapupTijd > 0 && _agent.AantalCalls > 0) ? Math.round(_agent.TotaleWrapupTijd/_agent.AantalCalls) : 0);
    _agent.AHT             = showTimeInSec ? 
                              Math.round((_agent.TotaleWrapupTijd > 0 && _agent.TotaleGespreksTijd > 0 && _agent.AantalCalls > 0) ? Math.round((_agent.TotaleWrapupTijd/_agent.AantalCalls) + (_agent.TotaleGespreksTijd/_agent.AantalCalls)) : 0)
                              : 
                              durationTime((_agent.TotaleWrapupTijd > 0 && _agent.TotaleGespreksTijd > 0 && _agent.AantalCalls > 0) ? Math.round((_agent.TotaleWrapupTijd/_agent.AantalCalls) + (_agent.TotaleGespreksTijd/_agent.AantalCalls)) : 0);         
    _agent.break           = showTimeInSec ?
                              _break ? Math.round(_break.StatusTime) : '0'
                              : 
                              _break ? durationTime(_break.StatusTime) : '00:00:00';
    _agent.coacheable      = coachable;
    _agent.statusAlert     = statusAlert(_agent.StatusId, _agent.startTime);

    return _agent;
  }

  let agentsEnriched = agents.reduce((agents, agent) => {
    agent.inRoutingGroups = routinggroups.reduce((ids, group) => {
      if(group.GroupMembers.indexOf(agent.GebruikerId) != -1) { 
        ids.push(group.Id);
      }
      return ids;
    }, []);

    if(queueIds.indexOf(agent.StatusId) > -1) {
      qTotal++;
    }

    if(_checkIfAgentIsInRoutingGroup(agent.inRoutingGroups, selRgIds)) {
      let _break = agent.StatusTijden.find(status => status.StatusId == 8);

      agent        = {...enrichAgent(agent)};

      totalCalls  += agent.AantalCalls;
      totAct      += agent.TotaleGespreksTijd;
      totAwt      += agent.TotaleWrapupTijd;
      totPause    += _break ? _break.StatusTime : 0;

      if(!agent.OnQueue) {
        offQuequeAgents.push(agent);
      } else {
        if(agentsPinned.indexOf(agent.GebruikerId) !== -1) {
          pinnedAgents.push(agent);
        } else {
          agents.push(agent);
        }
      }
    }

    return agents;
    
  }, []);
  
  pinnedAgents.sort(dynamicSortMultiple('statusLabel','StatusSeconden'));
  offQuequeAgents.sort(dynamicSortMultiple('statusLabel','StatusSeconden'));
  agentsEnriched.sort(dynamicSortMultiple('statusLabel','StatusSeconden'));
  
  agentsEnriched = [...pinnedAgents.concat(agentsEnriched)];

  if(showOffQueue) {
    agentsEnriched = [...agentsEnriched.concat(offQuequeAgents)];
  }

  self.postMessage({
    data   : agentsEnriched,
    totals : {
      totalAgents  : agents.length,
      queueTotals  : qTotal,
       totalCalls   : totalCalls,
       avgAct       : showTimeInSec ? Math.round(totalCalls > 0 ? totAct/totalCalls : 0)                         : durationTime(totalCalls > 0 ? totAct/totalCalls : 0),
       avgAwt       : showTimeInSec ? Math.round(totalCalls > 0 ? totAwt/totalCalls : 0)                         : durationTime(totalCalls > 0 ? totAwt/totalCalls : 0),
       avgAht       : showTimeInSec ? Math.round(totalCalls > 0 ? (totAct/totalCalls) + (totAwt/totalCalls) : 0) : durationTime(totalCalls > 0 ? (totAct/totalCalls) + (totAwt/totalCalls) : 0),
       avgPause     : showTimeInSec ? Math.round(agents.length > 0 ? totPause/agents.length : 0)                 : durationTime(agents.length > 0 ? totPause/agents.length : 0),
    }
  });

}, false);
