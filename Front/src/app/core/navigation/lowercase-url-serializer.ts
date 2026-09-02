import { DefaultUrlSerializer, UrlTree } from '@angular/router';

export class LowercaseUrlSerializer extends DefaultUrlSerializer {
    override parse(url: string): UrlTree {
        const [pathAndQuery, fragment] = url.split('#', 2);
        const [path, query] = pathAndQuery.split('?', 2);
        const normalizedUrl = `${path.toLowerCase()}${query ? `?${query}` : ''}${fragment ? `#${fragment}` : ''}`;

        return super.parse(normalizedUrl);
    }
}
