"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// the splitter function, used by the service
function splitter_function(args) {
    console.log('splitter_function');
    const splitter = args.splitter;
    const splitted_msg = args.message.split(splitter);
    const result = [];
    for (var i = 0; i < splitted_msg.length; i++) {
        result.push(splitted_msg[i]);
    }
    return {
        result: result
    };
}
const SOSService = {
    MessageSplitterService: {
        MessageSplitterServiceSoapPort: {
            MessageSplitter: splitter_function
        },
        MessageSplitterServiceSoap12Port: {
            MessageSplitter: splitter_function
        }
    }
};
exports.default = SOSService;
//# sourceMappingURL=SOSService.js.map